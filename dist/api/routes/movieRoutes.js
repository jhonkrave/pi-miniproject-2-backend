"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileoverview Movie routes for LumiFlix API - miniproject 2
 * @description Handles movie search, popular movies, favorites, and favorite operations
 * @author Equipo 8
 * @version 1.0.0
 */
const express_1 = require("express");
const FavoriteDAO_1 = __importDefault(require("../dao/FavoriteDAO"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const pexels_1 = require("pexels");
const tmdbService_1 = require("../services/tmdbService");
/**
 * Express router instance for movie routes
 * @type {Router}
 */
const router = (0, express_1.Router)();
/**
 * Pexels client instance
 * @description Creates a Pexels client instance with the API key
 * @type {Client}
 */
const client = (0, pexels_1.createClient)(process.env.PEXELS_API_KEY);
/**
 * Search for videos endpoint
 * @description Searches for videos using the Pexels API
 * @route POST /api/movies/search
 * @param {Object} req.body - Request body containing search query
 * @param {string} req.body.query - Search query
 * @returns {Object} Videos object
 * @throws {500} Internal server error
 */
router.post('/search', authMiddleware_1.default, async (req, res) => {
    try {
        const { query } = req.body;
        const videos = await client.videos.search({ query: query });
        res.json(videos);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Get popular videos endpoint
 * @description Gets 20 popular videos using the Pexels API
 * @route GET /api/movies/popular
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Videos object
 * @throws {500} Internal server error
 */
router.get('/popular', authMiddleware_1.default, async (req, res) => {
    try {
        const videos = await client.videos.popular({ per_page: 20 });
        res.json(videos);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Catalog endpoints (TMDB)
 * @section Catalog
 */
/**
 * Get TMDB genres
 * @route GET /api/movie/catalog/genres
 */
router.get('/catalog/genres', async (req, res) => {
    try {
        const language = req.query.language || undefined;
        const genres = await (0, tmdbService_1.getGenres)(language);
        res.json({ genres });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Alias: GET /api/movie/movies/genres
 */
router.get('/movies/genres', async (req, res) => {
    try {
        const language = req.query.language || undefined;
        const genres = await (0, tmdbService_1.getGenres)(language);
        res.json({ genres });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Get popular catalog movies
 * @route GET /api/movie/catalog/popular
 */
router.get('/catalog/popular', async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const language = req.query.language || undefined;
        const data = await (0, tmdbService_1.getPopular)(page, language);
        res.json(data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Unified movies listing endpoint for US-4
 * Behaviors:
 * - If q present -> search
 * - Else if genreId present -> discover by genre
 * - Else -> popular
 * @route GET /api/movie/movies
 */
router.get('/movies', async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const language = req.query.language || undefined;
        const q = req.query.q || req.query.query || '';
        const genreId = req.query.genreId || '';
        if (q && q.trim().length > 0) {
            const data = await (0, tmdbService_1.searchMovies)(q, page, language);
            res.json(data);
            return;
        }
        if (genreId && genreId.trim().length > 0) {
            const data = await (0, tmdbService_1.discoverByGenre)(genreId, page, language);
            res.json(data);
            return;
        }
        const data = await (0, tmdbService_1.getPopular)(page, language);
        res.json(data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Search catalog movies by text
 * @route GET /api/movie/catalog/search
 * @query q or query
 */
router.get('/catalog/search', async (req, res) => {
    try {
        const q = req.query.q || req.query.query || '';
        if (!q || q.trim().length === 0) {
            res.status(400).json({ message: 'Missing query parameter q' });
            return;
        }
        const page = Number(req.query.page || 1);
        const language = req.query.language || undefined;
        const data = await (0, tmdbService_1.searchMovies)(q, page, language);
        res.json(data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Discover catalog by genre
 * @route GET /api/movie/catalog/genre/:genreId
 */
router.get('/catalog/genre/:genreId', async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const language = req.query.language || undefined;
        const data = await (0, tmdbService_1.discoverByGenre)(req.params.genreId, page, language);
        res.json(data);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Get catalog movie details by TMDB id
 * @route GET /api/movie/catalog/:id
 */
router.get('/catalog/:id', async (req, res) => {
    try {
        const language = req.query.language || undefined;
        const movie = await (0, tmdbService_1.getMovieDetails)(req.params.id, language);
        res.json({ movie });
        return;
    }
    catch (error) {
        const status = /404/.test(String(error.message)) ? 404 : 500;
        res.status(status).json({ message: error.message });
        return;
    }
});
/**
 * Alias: GET /api/movie/movies/:id
 */
router.get('/movies/:id', async (req, res) => {
    try {
        const language = req.query.language || undefined;
        const movie = await (0, tmdbService_1.getMovieDetails)(req.params.id, language);
        res.json({ movie });
        return;
    }
    catch (error) {
        const status = /404/.test(String(error.message)) ? 404 : 500;
        res.status(status).json({ message: error.message });
        return;
    }
});
/**
 * Watch endpoint: Given a TMDB movie id, return a Pexels video to play
 * Strategy: resolve TMDB title, search in Pexels for a likely trailer/cinematic clip
 * @route GET /api/movie/watch/:id
 */
router.get('/watch/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const language = req.query.language || undefined;
        const movie = await (0, tmdbService_1.getMovieDetails)(req.params.id, language);
        const baseQuery = movie.title;
        // Try multiple queries for better hit rate
        const queries = [
            `${baseQuery} official trailer`,
            `${baseQuery} trailer`,
            `${baseQuery} cinematic`,
            `${baseQuery}`,
            `movie trailer`
        ];
        let result = null;
        for (const q of queries) {
            const r = await client.videos.search({ query: q, per_page: 10 });
            if (r?.videos?.length) {
                result = r.videos[0];
                break;
            }
        }
        if (!result) {
            res.status(404).json({ message: 'No playable video found in Pexels for this movie' });
            return;
        }
        res.json({
            movie,
            video: result,
            provider: 'pexels'
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Get favorites
 * @description Gets favorites videos by user id
 * @param {string} userId - User ID
 * @returns {IFavorite[]} Favorites array
 */
const getfavorites = async (userId) => {
    const favorites = await FavoriteDAO_1.default.getAll({ userId: userId });
    return favorites;
};
/**
 * Get favorites endpoint
 * @description Gets favorites videos by user
 * @route GET /api/movies/favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Videos object
 * @throws {500} Internal server error
 */
router.get('/favorites', authMiddleware_1.default, async (req, res) => {
    try {
        const favorites = await getfavorites(req.userId);
        const movies = await Promise.all(favorites.map(async (favorite) => {
            try {
                const movie = await (0, tmdbService_1.getMovieDetails)(favorite.movieId);
                return movie;
            }
            catch (_e) {
                return null;
            }
        }));
        const filtered = movies.filter(Boolean);
        res.json({ movies: filtered, total: filtered.length });
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Add favorite endpoint
 * @description Adds a favorite video to the database
 * @route POST /api/movies/favorite
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Favorite object
 * @throws {500} Internal server error
 */
router.post('/favorite', authMiddleware_1.default, async (req, res) => {
    try {
        const { movieId } = req.body;
        const favorite = await FavoriteDAO_1.default.create({ userId: req.userId, movieId: movieId });
        res.json(favorite);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Delete favorite endpoint
 * @description Deletes a favorite video from the database
 * @route DELETE /api/movies/favorite
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Favorite object
 * @throws {500} Internal server error
 */
router.delete('/favorite', authMiddleware_1.default, async (req, res) => {
    try {
        const { movieId } = req.body;
        const favorite = await FavoriteDAO_1.default.findOne({ userId: req.userId, movieId: movieId });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        await FavoriteDAO_1.default.delete(favorite._id);
        res.json(favorite);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
/**
 * Export router instance
 * @description Exports the router instance for use in the main application
 * @type {Router}
 */
exports.default = router;
