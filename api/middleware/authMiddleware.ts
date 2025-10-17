import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Authenticate requests using JWT from HttpOnly cookie or Authorization header.
 */
export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const tokenFromCookie = (req as any).cookies && (req as any).cookies.token;
    const authHeader = req.headers['authorization'] || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = tokenFromCookie || tokenFromHeader;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    (req as any).userId = decoded.userId;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}


