/**
 * @fileoverview Authentication middleware for LumiFlix API - miniproject 2
 * @description JWT-based authentication middleware that validates tokens from cookies
 * or Authorization headers and protects API routes
 * @author Equipo 8
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware function
 * @description Validates JWT tokens from HttpOnly cookies or Authorization headers
 * and adds user ID to request object for protected routes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @throws {401} Unauthorized if no token provided or token is invalid/expired
 */
export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    /**
     * Extract JWT token from HttpOnly cookie
     * @description Checks for token in request cookies (preferred method)
     */
    const tokenFromCookie = (req as any).cookies && (req as any).cookies.token;
    
    /**
     * Extract JWT token from Authorization header
     * @description Checks for Bearer token in Authorization header (fallback method)
     */
    const authHeader = req.headers['authorization'] || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    /**
     * Select token from cookie (preferred) or header (fallback)
     * @description Prioritizes cookie-based authentication over header-based
     */
    const token = tokenFromCookie || tokenFromHeader;
    
    /**
     * Validate token presence
     * @description Returns 401 if no token is found in either location
     */
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    /**
     * Verify and decode JWT token
     * @description Validates token signature and extracts user ID
     * @throws {JsonWebTokenError} If token is malformed or invalid
     * @throws {TokenExpiredError} If token has expired
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    
    /**
     * Add user object to request object for compatibility with comment routes
     * @description Makes user data available to subsequent middleware and route handlers
     */
    (req as any).user = {
      _id: decoded.userId,
      // Agrega otros campos si están disponibles en el token
    };
    
    /**
     * Continue to next middleware/route handler
     * @description Authentication successful, proceed with request processing
     */
    next();
  } catch (_error) {
    /**
     * Handle token verification errors
     * @description Returns 401 for any JWT verification failure (invalid, expired, malformed)
     */
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}


