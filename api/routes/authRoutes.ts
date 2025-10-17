import { Router, NextFunction, CookieOptions, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserDAO from '../dao/UserDAO';
import { sendPasswordResetEmail, isSmtpConfigured } from '../utils/mailer';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();
const isDev = process.env.NODE_ENV !== 'production';

const signToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '2h' });
};

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 2 * 60 * 60 * 1000,
  path: '/',
};

const emailRegex = /^(?:[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+(?:\.[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const passwordRegexSignup = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const passwordRegexReset = passwordRegexSignup;

// Simple in-memory rate limiter (per IP) for login
const loginRequestsByIp = new Map<string, { count: number; windowStart: number }>();
const loginRateLimit: RequestHandler = (req, res, next: NextFunction) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 10;
  const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress as string) || 'unknown') as string;
  const entry = loginRequestsByIp.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > windowMs) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  loginRequestsByIp.set(ip, entry);
  if (entry.count > max) {
    res.status(429).json({ message: 'Too many login attempts. Try again later.' });
    return;
  }
  next();
}

/**
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body as any;
    const firstname = (req.body as any).firstname || (req.body as any).firstName;
    const lastname = (req.body as any).lastname || (req.body as any).lastName;
    const age = (req.body as any).age;
    if (!email || !password || !firstname || !lastname || age === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!passwordRegexSignup.test(password)) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements' });
    }
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 13) {
      return res.status(400).json({ message: 'Age must be an integer and at least 13' });
    }
    const existingByEmail = await (UserDAO as any).findOne({ email });
    if (existingByEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await (UserDAO as any).create({ email, password: hashed, firstname, lastname, age: numericAge });
    res.status(201).json({ user: { id: user._id, email: user.email, firstName: user.firstname, lastName: user.lastname, age: user.age, createdAt: user.createdAt.toISOString() } });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body as any;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const user: any = await (UserDAO as any).findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ message: 'Account locked. Try later' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const attempts = (user.loginAttempts || 0) + 1;
      let lockUntil = user.lockUntil;
      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await (UserDAO as any).update(user._id, { loginAttempts: attempts, lockUntil });
      return res.status(attempts >= 5 ? 423 : 401).json({ message: attempts >= 5 ? 'Account locked. Try later' : 'Invalid credentials' });
    }
    if (user.loginAttempts || user.lockUntil) {
      await (UserDAO as any).update(user._id, { loginAttempts: 0, lockUntil: null });
    }
    const token = signToken(String(user._id));
    res.cookie('token', token, cookieOptions);
    res.json({ user: { id: user._id, email: user.email, firstName: user.firstname, lastName: user.lastname, age: user.age, createdAt: user.createdAt.toISOString() } });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out' });
  return;
});

/**
 * POST /api/auth/password/forgot
 */
router.post('/password/forgot', async (req, res) => {
  try {
    const rawEmail = (req.body as any)?.email;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    if (isDev) {
      console.log('[forgot] request:', { email });
    }
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (!emailRegex.test(email)) return res.status(202).json({ message: 'Si el correo existe, te enviaremos un enlace' });
    const user: any = await (UserDAO as any).findOne({ email });
    if (isDev) {
      console.log('[forgot] userFound:', Boolean(user));
    }
    if (!user) return res.status(202).json({ message: 'Si el correo existe, te enviaremos un enlace' });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    await (UserDAO as any).update(user._id, { resetPasswordToken: token, resetPasswordExpires: expires });
    // Respond immediately, send email in background to avoid client timeouts
    res.status(202).json({ message: 'Si el correo existe, te enviaremos un enlace' });
    if (isDev) {
      console.log('[forgot] smtpConfigured:', isSmtpConfigured());
      console.log('[forgot] queue email with token:', token.slice(0, 6) + '…');
    }
    Promise.resolve()
      .then(() => sendPasswordResetEmail({ to: email, token }))
      .then(() => { if (isDev) console.log('[forgot] email send completed'); })
      .catch((mailErr: any) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Mail send error:', mailErr?.message || mailErr);
        }
      });
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('forgot error:', error.message);
    }
    res.status(500).json({ message: 'Inténtalo de nuevo más tarde' });
    return;
  }
});

/**
 * POST /api/auth/password/reset
 */
router.post('/password/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body as any;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and newPassword are required' });
    if (!passwordRegexReset.test(newPassword)) return res.status(400).json({ message: 'Password does not meet complexity requirements' });
    const user: any = await (UserDAO as any).findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await (UserDAO as any).update(user._id, { password: hashed, resetPasswordToken: null, resetPasswordExpires: null });
    res.status(200).json({ message: 'Contraseña actualizada' });
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('reset error:', error.message);
    }
    res.status(500).json({ message: 'Inténtalo de nuevo más tarde' });
    return;
  }
});

/**
 * GET /api/auth/password/verify?token=XYZ
 */
router.get('/password/verify', async (req, res) => {
  try {
    const { token } = req.query as any;
    if (!token) return res.status(400).json({ valid: false, message: 'Token requerido' });
    const user = await (UserDAO as any).findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(200).json({ valid: false, message: 'Enlace inválido o caducado' });
    res.status(200).json({ valid: true });
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('verify error:', error.message);
    }
    res.status(500).json({ message: 'Inténtalo de nuevo más tarde' });
    return;
  }
});

/**
 * GET /api/auth/users/me
 */
router.get('/users/me', authMiddleware as any, async (req, res) => {
  try {
    const user = await (UserDAO as any).findOne({ _id: (req as any).userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      id: user._id,
      firstName: user.firstname,
      lastName: user.lastname,
      age: user.age,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('profile get error:', error.message);
    }
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

/**
 * PUT /api/auth/users/me
 */
router.put('/users/me', (authMiddleware as any), async (req, res) => {
  try {
    const email = (req.body as any).email;
    const firstname = (req.body as any).firstname || (req.body as any).firstName;
    const lastname = (req.body as any).lastname || (req.body as any).lastName;
    const age = (req.body as any).age;
    const userId = (req as any).userId;

    if (!firstname || !lastname || age === undefined || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 13) {
      return res.status(400).json({ message: 'Age must be an integer and at least 13' });
    }
    const existingUser = await (UserDAO as any).findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const updatedUser = await (UserDAO as any).update(userId, { firstname, lastname, age: numericAge, email });
    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstname,
      lastName: updatedUser.lastname,
      age: updatedUser.age,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
    res.status(200).json(userResponse);
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Profile update error:', error.message);
    }
    if ((error as any).name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    if ((error as any).message && (error as any).message.includes('Document not found')) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

/**
 * DELETE /api/auth/users/me
 */
router.delete('/users/me', (authMiddleware as any), async (req, res) => {
  try {
    const { password, confirmation } = req.body as any;
    const userId = (req as any).userId;
    if (!password || !confirmation) {
      return res.status(400).json({ message: 'Password and confirmation are required' });
    }
    if (confirmation !== 'ELIMINAR') {
      return res.status(400).json({ message: 'Invalid confirmation text' });
    }
    const user: any = await (UserDAO as any).findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    await (UserDAO as any).delete(userId);
    res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
    res.status(204).send();
    return;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Account delete error:', error.message);
    }
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

export default router;


