/**
 * @fileoverview Subtitle routes for LumiFlix API - MiniProject 2
 * @description Defines REST API endpoints for managing movie subtitles
 * @author Team 8
 * @version 1.0.0
 */

import { Router } from 'express';
import SubtitleDAO from '../dao/SubtitleDAO';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

/**
 * Authentication middleware for all subtitle routes
 * @middleware
 */
router.use(authMiddleware as any);

/**
 * GET /api/subtitles/movie/:movieId
 * @description Gets all available subtitles for a movie (US-10 requirement)
 * @param {string} movieId - The movie ID (TMDB ID)
 * @returns {Object} Response object with available subtitles
 * @throws {500} Internal server error if subtitles cannot be fetched
 */
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    const subtitles = await SubtitleDAO.getSubtitlesByMovie(movieId);

    if (subtitles.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subtitles not available',
        data: [],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subtitles retrieved successfully',
      data: subtitles,
    });
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/subtitles/movie/:movieId/:language
 * @description Gets a specific subtitle for a movie in a given language (US-10 requirement)
 * @param {string} movieId - The movie ID (TMDB ID)
 * @param {string} language - The subtitle language ('es' for Spanish, 'en' for English)
 * @returns {Object} Response object with the subtitle data
 * @throws {400} Bad request if language is invalid
 * @throws {404} Not found if subtitle is not available
 * @throws {500} Internal server error if subtitle cannot be fetched
 */
router.get('/movie/:movieId/:language', async (req, res) => {
  try {
    const { movieId, language } = req.params;

    // Validate language parameter
    if (language !== 'es' && language !== 'en') {
      res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages are: es (Spanish), en (English)',
      });
      return;
    }

    const subtitle = await SubtitleDAO.getSubtitleByMovieAndLanguage(
      movieId,
      language as 'es' | 'en'
    );

    if (!subtitle) {
      res.status(404).json({
        success: false,
        message: `Subtitles not available for language: ${language}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subtitle retrieved successfully',
      data: subtitle,
    });
  } catch (error) {
    console.error('Error fetching subtitle:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /api/subtitles
 * @description Creates or updates a subtitle for a movie (Admin/Management endpoint)
 * @param {string} movieId - The movie ID (TMDB ID)
 * @param {string} language - The subtitle language ('es' or 'en')
 * @param {string} url - The subtitle file URL (.vtt file or remote track URL)
 * @param {string} [label] - Optional human-readable label
 * @param {boolean} [isDefault=false] - Whether this subtitle is the default one
 * @returns {Object} Response object with the created/updated subtitle data
 * @throws {400} Bad request if required fields are missing or invalid
 * @throws {500} Internal server error if subtitle cannot be created/updated
 */
router.post('/', async (req, res) => {
  try {
    const { movieId, language, url, label, isDefault } = req.body;

    // Input validations
    if (!movieId || !language || !url) {
      res.status(400).json({
        success: false,
        message: 'Movie ID, language, and URL are required',
      });
      return;
    }

    // Validate language
    if (language !== 'es' && language !== 'en') {
      res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages are: es (Spanish), en (English)',
      });
      return;
    }

    // Validate URL format (basic validation)
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        message: 'Invalid URL format',
      });
      return;
    }

    const subtitle = await SubtitleDAO.createOrUpdateSubtitle(
      movieId,
      language as 'es' | 'en',
      url,
      label,
      isDefault || false
    );

    res.status(201).json({
      success: true,
      message: 'Subtitle created/updated successfully',
      data: subtitle,
    });
  } catch (error) {
    console.error('Error creating/updating subtitle:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/subtitles/movie/:movieId/:language
 * @description Deletes a subtitle for a movie in a given language (Admin/Management endpoint)
 * @param {string} movieId - The movie ID (TMDB ID)
 * @param {string} language - The subtitle language ('es' or 'en')
 * @returns {Object} Response object with success message and deleted subtitle data
 * @throws {400} Bad request if language is invalid
 * @throws {404} Not found if subtitle doesn't exist
 * @throws {500} Internal server error if subtitle cannot be deleted
 */
router.delete('/movie/:movieId/:language', async (req, res) => {
  try {
    const { movieId, language } = req.params;

    // Validate language parameter
    if (language !== 'es' && language !== 'en') {
      res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages are: es (Spanish), en (English)',
      });
      return;
    }

    const deletedSubtitle = await SubtitleDAO.deleteSubtitle(
      movieId,
      language as 'es' | 'en'
    );

    if (!deletedSubtitle) {
      res.status(404).json({
        success: false,
        message: 'Subtitle not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subtitle deleted successfully',
      data: deletedSubtitle,
    });
  } catch (error) {
    console.error('Error deleting subtitle:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;

