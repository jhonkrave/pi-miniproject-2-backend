/**
 * @fileoverview Comment routes for LumiFlix API - MiniProject 2
 * @description Defines REST API endpoints for managing movie comments
 * @author Team 8
 * @version 1.0.0
 */

import { Router } from 'express';
import CommentDAO from '../dao/CommentDAO';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

/**
 * Authentication middleware for all comment routes
 * @middleware
 */
router.use(authMiddleware as any);

/**
 * GET /api/comments/movie/:movieId
 * @description Retrieves comments for a specific movie with pagination
 * @param {string} movieId - The movie ID
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of comments per page
 * @returns {Object} Response object with comments data and pagination info
 * @throws {500} Internal server error if comments cannot be fetched
 */
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CommentDAO.getCommentsByMovie(movieId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching comments by movie:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/comments/user
 * @description Retrieves comments made by the authenticated user with pagination
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of comments per page
 * @returns {Object} Response object with user's comments data and pagination info
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {500} Internal server error if comments cannot be fetched
 */
router.get('/user', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const result = await CommentDAO.getCommentsByUser(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'User comments retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/comments
 * @description Creates a new comment for a movie
 * @param {string} movieId - The movie ID to comment on
 * @param {string} content - The comment content (max 2000 characters)
 * @returns {Object} Response object with the created comment data
 * @throws {400} Bad request if movieId or content are missing, or content exceeds limit
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {500} Internal server error if comment cannot be created
 */
router.post('/', async (req, res) => {
  try {
    const { movieId, content } = req.body;
    const userId = (req as any).userId;

    // Input validations
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

    // Validate that content is not empty after trimming (US-9 requirement)
    if (typeof content === 'string' && content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty',
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

    const comment = await CommentDAO.createComment({
      userId,
      movieId,
      content,
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * PUT /api/comments/:commentId
 * @description Updates the content of an existing comment
 * @param {string} commentId - The ID of the comment to update
 * @param {string} content - The new comment content
 * @returns {Object} Response object with the updated comment data
 * @throws {400} Bad request if content is missing
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {403} Forbidden if user is not the comment owner
 * @throws {500} Internal server error if comment cannot be updated
 */
router.put('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

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

    const updatedComment = await CommentDAO.updateComment(commentId, userId, content);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment,
    });
  } catch (error) {
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
 * @description Deletes an existing comment
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Object} Response object with success message and deleted comment data
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {403} Forbidden if user is not the comment owner
 * @throws {500} Internal server error if comment cannot be deleted
 */
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const deletedComment = await CommentDAO.deleteComment(commentId, userId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: deletedComment,
    });
  } catch (error) {
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

export default router;