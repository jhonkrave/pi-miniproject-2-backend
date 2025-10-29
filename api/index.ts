/**
 * @fileoverview Main API server for miniproject 2
 * @description Express server configuration with authentication middleware,
 * CORS, cookies, and authentication routes
 * @author Equipo 8
 * @version 1.0.0
 */

import 'dotenv/config';
import './bootstrap/dns';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/CommentRoutes'; // ← NUEVA IMPORTACIÓN

/**
 * Main Express application instance
 * @type {express.Application}
 */
const app = express();

/**
 * Environment variables configuration for DNS and TLS optimization
 * Prefers IPv4 for outbound DNS to avoid SMTP IPv6 timeouts in some hosts
 * @description Configuration that can be overridden by environment variables if needed
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '1';
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''}`.trim();

/**
 * Database connection
 * @description Establishes connection with the configured database
 */
connectDB();

/**
 * Proxy trust configuration for secure cookies
 * @description Required for secure cookies behind proxies like Render
 */
app.set('trust proxy', 1);

/**
 * JSON and URL-encoded parsing middleware
 * @description Middleware configuration for processing input data
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * CORS configuration based on environment variables
 * @description Processes allowed origins from CORS_ORIGIN environment variable
 * @type {string[]}
 */
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/**
 * CORS configuration options
 * @description Configuration that allows specific origins and credentials
 * @type {CorsOptions}
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

/**
 * CORS middleware
 * @description Applies CORS configuration to all routes
 */
app.use(cors(corsOptions));

/**
 * Server status route
 * @description Basic endpoint that confirms the server is running
 * @route GET /
 */
app.get('/', (_req, res) => { res.send('Server is running'); });

/**
 * Server health check route
 * @description Health check endpoint that returns server status
 * @route GET /health
 * @returns {Object} Object with 'ok' status
 */
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

/**
 * API routes
 * @description Mounts authentication routes under /api/auth prefix
 * @description Mounts comment routes under /api/comments prefix
 */
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes); // ← NUEVA RUTA

/**
 * Server initialization
 * @description Only starts the server if this file is run directly
 * @description Does not start server if file is imported as module
 */
if (require.main === module) {
  /**
   * Server port
   * @description Port obtained from PORT environment variable or 3000 as default
   * @type {number}
   */
  const PORT = Number(process.env.PORT || 3000);
  
  /**
   * Starts HTTP server
   * @description Listens on specified port and shows confirmation message
   * @param {number} PORT - Port to listen on
   * @param {Function} callback - Callback function executed when server starts
   */
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

/**
 * Express application export
 * @description Allows importing the application in other modules for testing or modular use
 * @type {express.Application}
 */
export default app;