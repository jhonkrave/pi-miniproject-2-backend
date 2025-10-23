/**
 * @fileoverview Movie routes for LumiFlix API - miniproject 2
 * @description Handles movie search, popular movies, favorites, and favorite operations
 * @author Equipo 8
 * @version 1.0.0
 */
import { Router } from 'express';
import FavoriteDAO from '../dao/FavoriteDAO';
import { IFavorite } from '../models/Favorite';
import authMiddleware from '../middleware/authMiddleware';
import { createClient } from "pexels";

/**
 * Express router instance for movie routes
 * @type {Router}
 */
const router = Router();

/**
 * Pexels client instance
 * @description Creates a Pexels client instance with the API key
 * @type {Client}
 */
const client = createClient(process.env.PEXELS_API_KEY as string);

/**
 * Search for videos endpoint
 * @description Searches for videos using the Pexels API
 * @route POST /api/movies/search
 * @param {Object} req.body - Request body containing search query
 * @param {string} req.body.query - Search query
 * @returns {Object} Videos object
 * @throws {500} Internal server error
 */
router.post('/search',authMiddleware as any, async (req, res) => {
    try {
        const { query } = req.body as any;
        const videos = await client.videos.search({query: query as string});
        res.json(videos);
        return;
    } catch (error: any) {
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
router.get('/popular',authMiddleware as any, async (req, res) => {
    try {
        const videos = await client.videos.popular({per_page: 20});
        res.json(videos);
        return;
    } catch (error: any) {
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
const getfavorites = async (userId: string) => {
    const favorites = await (FavoriteDAO as any).getAll({ userId: userId });
    return favorites;
}

/**
 * Get favorites endpoint
 * @description Gets favorites videos by user 
 * @route GET /api/movies/favorites
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Videos object
 * @throws {500} Internal server error
 */
router.get('/favorites',authMiddleware as any, async (req, res) => {
    try {
        const favorites: IFavorite[] = await getfavorites((req as any).userId);
        //console.log(favorites);
        //const video = await client.videos.show({id: favorites[1].movieId as string})
         const videos: any[] = await Promise.all(favorites.map(async (favorite) => {
            const video = await client.videos.show({id: favorite.movieId as string});
            return video;
        })); 
        
        res.json({videos});
        return;
    } catch (error: any) {
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
router.post('/favorite',authMiddleware as any, async (req, res) => {
    try {
        const { movieId } = req.body as any;
        const favorite = await (FavoriteDAO as any).create({ userId: (req as any).userId, movieId: movieId });
        res.json(favorite);
        return;
    } catch (error: any) {
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
router.delete('/favorite',authMiddleware as any, async (req, res) => {
    try {
        const { movieId } = req.body as any;
        const favorite = await (FavoriteDAO as any).findOne({ userId: (req as any).userId, movieId: movieId });
        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        await (FavoriteDAO as any).delete(favorite._id);
        res.json(favorite);
        return;
    } catch (error: any) {
        res.status(500).json({ message: error.message });
        return;
    }
});

/**
 * Export router instance
 * @description Exports the router instance for use in the main application
 * @type {Router}
 */
export default router;