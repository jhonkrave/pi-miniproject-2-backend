/**
 * @fileoverview Rating routes for LumiFlix API - MiniProject 2
 * @description Defines REST API endpoints for managing movie ratings
 * @author Team 8
 * @version 1.0.0
 */

import { Router } from 'express';
import RatingDAO from '../dao/RatingDAO';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

/**
 * Authentication middleware for all rating routes
 * @middleware
 */
router.use(authMiddleware as any);

/**
 * POST /api/ratings
 * @description Creates a new rating or updates an existing one for a movie
 * @param {string} movieId - The movie ID to rate
 * @param {number} stars - The rating value (1-5)
 * @returns {Object} Response object with the created/updated rating data
 * @throws {400} Bad request if movieId or stars are missing or invalid
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {500} Internal server error if rating cannot be created/updated
 */
router.post('/', async (req, res) => {
  try {
    const { movieId, stars } = req.body;
    const userId = (req as any).userId;

    // Input validations
    if (!movieId || stars === undefined) {
      res.status(400).json({
        success: false,
        message: 'Movie ID and stars are required',
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

    // Validate stars value
    const starsNum = parseInt(stars, 10);
    if (isNaN(starsNum) || starsNum < 1 || starsNum > 5) {
      res.status(400).json({
        success: false,
        message: 'Stars must be a number between 1 and 5',
      });
      return;
    }

    const rating = await RatingDAO.createOrUpdateRating(
      userId,
      movieId,
      starsNum as 1|2|3|4|5
    );

    res.status(201).json({
      success: true,
      message: 'Rating created/updated successfully',
      data: rating,
    });
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * PUT /api/ratings/:id
 * @description Updates an existing rating (US-8 requirement)
 * @param {string} id - The ID of the rating to update
 * @param {number} stars - The new rating value (1-5)
 * @returns {Object} Response object with the updated rating data
 * @throws {400} Bad request if stars is missing or invalid
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {403} Forbidden if user is not the rating owner
 * @throws {500} Internal server error if rating cannot be updated
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stars } = req.body;
    const userId = (req as any).userId;

    if (!stars) {
      res.status(400).json({
        success: false,
        message: 'Stars value is required',
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

    // Validate stars value
    const starsNum = parseInt(stars, 10);
    if (isNaN(starsNum) || starsNum < 1 || starsNum > 5) {
      res.status(400).json({
        success: false,
        message: 'Stars must be a number between 1 and 5',
      });
      return;
    }

    const updatedRating = await RatingDAO.updateRating(id, userId, starsNum as 1|2|3|4|5);

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating,
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own ratings',
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
 * GET /api/ratings/movie/:movieId
 * @description Gets the average rating and statistics for a movie (US-8 requirement)
 * @param {string} movieId - The movie ID
 * @returns {Object} Response object with average rating, total count, and distribution
 * @throws {500} Internal server error if rating data cannot be fetched
 */
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    const result = await RatingDAO.getAverageRatingByMovie(movieId);

    res.status(200).json({
      success: true,
      message: 'Rating statistics retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching rating statistics:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/ratings/movie/:movieId/user
 * @description Gets the rating given by the authenticated user for a movie
 * @param {string} movieId - The movie ID
 * @returns {Object} Response object with the user's rating data
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {404} Not found if user hasn't rated the movie
 * @throws {500} Internal server error if rating cannot be fetched
 */
router.get('/movie/:movieId/user', async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const rating = await RatingDAO.getRatingByUserAndMovie(userId, movieId);

    if (!rating) {
      res.status(404).json({
        success: false,
        message: 'Rating not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User rating retrieved successfully',
      data: rating,
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/ratings/movie/:movieId/all
 * @description Gets all ratings for a movie with pagination
 * @param {string} movieId - The movie ID
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of ratings per page
 * @returns {Object} Response object with ratings data and pagination info
 * @throws {500} Internal server error if ratings cannot be fetched
 */
router.get('/movie/:movieId/all', async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await RatingDAO.getRatingsByMovie(movieId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Ratings retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching ratings by movie:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/ratings/:id
 * @description Deletes an existing rating
 * @param {string} id - The ID of the rating to delete
 * @returns {Object} Response object with success message and deleted rating data
 * @throws {401} Unauthorized if user is not authenticated
 * @throws {403} Forbidden if user is not the rating owner
 * @throws {500} Internal server error if rating cannot be deleted
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const deletedRating = await RatingDAO.deleteRating(id, userId);

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully',
      data: deletedRating,
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own ratings',
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

