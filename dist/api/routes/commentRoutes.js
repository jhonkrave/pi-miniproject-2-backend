"use strict";
/**
 * @fileoverview Comment routes for LumiFlix API - miniproject 2
 * @description Defines REST API endpoints for managing movie comments
 * @author Equipo 8
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommentDAO_1 = __importDefault(require("../dao/CommentDAO"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
/**
 * Middleware de autenticación para todas las rutas de comentarios
 */
// ✅ CORREGIDO: Usar el middleware correctamente
router.use(authMiddleware_1.default);
/**
 * GET /api/comments/movie/:movieId
 * @description Obtiene los comentarios de una película específica con paginación
 */
router.get('/movie/:movieId', async (req, res) => {
    try {
        const { movieId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await CommentDAO_1.default.getCommentsByMovie(movieId, page, limit);
        res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        console.error('Error fetching comments by movie:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
/**
 * GET /api/comments/user
 * @description Obtiene los comentarios del usuario autenticado con paginación
 */
router.get('/user', async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const result = await CommentDAO_1.default.getCommentsByUser(userId, page, limit);
        res.status(200).json({
            success: true,
            message: 'User comments retrieved successfully',
            data: result,
        });
    }
    catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
/**
 * POST /api/comments
 * @description Crea un nuevo comentario para una película
 */
router.post('/', async (req, res) => {
    try {
        const { movieId, content } = req.body;
        const userId = req.userId;
        // Validaciones de entrada
        if (!movieId || !content) {
            res.status(400).json({
                success: false,
                message: 'Movie ID and content are required',
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (content.length > 2000) {
            res.status(400).json({
                success: false,
                message: 'Comment content cannot exceed 2000 characters',
            });
            return;
        }
        const comment = await CommentDAO_1.default.createComment({
            userId,
            movieId,
            content,
        });
        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment,
        });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
/**
 * PUT /api/comments/:commentId
 * @description Actualiza el contenido de un comentario existente
 */
router.put('/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.userId;
        if (!content) {
            res.status(400).json({
                success: false,
                message: 'Content is required',
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const updatedComment = await CommentDAO_1.default.updateComment(commentId, userId, content);
        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment,
        });
    }
    catch (error) {
        console.error('Error updating comment:', error);
        if (error instanceof Error && error.message.includes('unauthorized')) {
            res.status(403).json({
                success: false,
                message: 'You can only update your own comments',
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
/**
 * DELETE /api/comments/:commentId
 * @description Elimina un comentario existente
 */
router.delete('/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const deletedComment = await CommentDAO_1.default.deleteComment(commentId, userId);
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: deletedComment,
        });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        if (error instanceof Error && error.message.includes('unauthorized')) {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own comments',
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
exports.default = router;
