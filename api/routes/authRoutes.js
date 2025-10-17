const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserDAO = require("../dao/UserDAO");
const { sendPasswordResetEmail } = require("../utils/mailer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// helpers
const signToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const emailRegex = /^(?:[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+(?:\.[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const passwordRegexSignup = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; // 8+, lower, upper, digit, special
const passwordRegexReset = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // 8+, lower, upper, digit

// No username autogeneration in sprint 1

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password, firstname, lastname, age } = req.body;
        if (!email || !password || !firstname || !lastname || age === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (!passwordRegexSignup.test(password)) {
            return res.status(400).json({ message: "Password does not meet complexity requirements" });
        }
        const numericAge = Number(age);
        if (!Number.isInteger(numericAge) || numericAge < 13) {
            return res.status(400).json({ message: "Age must be an integer and at least 13" });
        }

        const existingByEmail = await UserDAO.findOne({ email });
        if (existingByEmail) {
            return res.status(409).json({ message: "Email already exists" });
        }
        let userData = { email, firstname, lastname, age: numericAge };
        const hashed = await bcrypt.hash(password, 10);
        userData.password = hashed;
        const user = await UserDAO.create(userData);
        const token = signToken(user._id.toString());
        return res.status(201).json({ token, user: { id: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname, age: user.age, createdAt: user.createdAt.toISOString() } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Missing email or password" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const user = await UserDAO.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken(user._id.toString());
        return res.json({ token, user: { id: user._id, email: user.email, firstname: user.firstname, lastname: user.lastname, age: user.age, createdAt: user.createdAt.toISOString() } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/logout (stateless - client drops token)
router.post("/logout", (req, res) => {
    return res.json({ message: "Logged out" });
});

// Password reset request
router.post("/password/forgot", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });
        if (!emailRegex.test(email)) return res.status(202).json({ message: "Si el correo existe, te enviaremos un enlace" });
        const user = await UserDAO.findOne({ email });
        // Always respond 202 to prevent enumeration
        if (!user) return res.status(202).json({ message: "Si el correo existe, te enviaremos un enlace" });
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await UserDAO.update(user._id, { resetPasswordToken: token, resetPasswordExpires: expires });
        try {
            await sendPasswordResetEmail({ to: email, token });
        } catch (mailErr) {
            if (process.env.NODE_ENV !== "production") {
                console.error("Mail send error:", mailErr.message);
            }
        }
        return res.status(202).json({ message: "Si el correo existe, te enviaremos un enlace" });
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("forgot error:", error.message);
        }
        return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
});

// Password reset confirm
router.post("/password/reset", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ message: "Token and newPassword are required" });
        if (!passwordRegexReset.test(newPassword)) return res.status(400).json({ message: "Password does not meet complexity requirements" });
        const user = await UserDAO.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });
        const hashed = await bcrypt.hash(newPassword, 10);
        await UserDAO.update(user._id, { password: hashed, resetPasswordToken: null, resetPasswordExpires: null });
        return res.status(200).json({ message: "Contraseña actualizada" });
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("reset error:", error.message);
        }
        return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
});

// GET /api/auth/password/verify?token=XYZ
router.get("/password/verify", async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ valid: false, message: "Token requerido" });
        const user = await UserDAO.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
        if (!user) return res.status(200).json({ valid: false, message: "Enlace inválido o caducado" });
        return res.status(200).json({ valid: true });
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.error("verify error:", error.message);
        }
        return res.status(500).json({ message: "Inténtalo de nuevo más tarde" });
    }
});

// PUT /api/auth/users/me - Update user profile
router.put("/users/me", authMiddleware, async (req, res) => {
    try {
        const { firstname, lastname, age, email } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!firstname || !lastname || age === undefined || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate email format (RFC 5322)
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Validate age (≥13 and integer)
        const numericAge = Number(age);
        if (!Number.isInteger(numericAge) || numericAge < 13) {
            return res.status(400).json({ message: "Age must be an integer and at least 13" });
        }

        // Check if email is already in use by another user
        const existingUser = await UserDAO.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Update user profile
        const updatedUser = await UserDAO.update(userId, {
            firstname,
            lastname,
            age: numericAge,
            email
        });

        // Return updated user data (without sensitive fields)
        const userResponse = {
            id: updatedUser._id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            age: updatedUser.age,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString()
        };

        return res.status(200).json(userResponse);

    } catch (error) {
        // Log error only in development
        if (process.env.NODE_ENV !== "production") {
            console.error("Profile update error:", error.message);
        }

        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Invalid data format" });
        }
        
        if (error.message.includes('Document not found')) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generic 5xx error
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE /api/auth/users/me - Delete user account
router.delete("/users/me", authMiddleware, async (req, res) => {
    try {
        const { password, confirmation } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!password || !confirmation) {
            return res.status(400).json({ message: "Password and confirmation are required" });
        }

        // Check confirmation text
        if (confirmation !== "ELIMINAR") {
            return res.status(400).json({ message: "Invalid confirmation text" });
        }

        // Find user
        const user = await UserDAO.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Delete associated tasks
        await Task.deleteMany({ ownerId: userId });

        // Delete user
        await UserDAO.delete(userId);

        return res.status(204).send();

    } catch (error) {
        // Log error only in development
        if (process.env.NODE_ENV !== "production") {
            console.error("Account delete error:", error.message);
        }

        // Generic 5xx error
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;