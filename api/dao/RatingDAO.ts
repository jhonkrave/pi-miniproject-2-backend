/**
 * @fileoverview Rating Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides CRUD operations for rating documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */

import GlobalDAO from './GlobalDAO';
import Rating, { IRating } from '../models/Rating';

/**
 * Rating Data Access Object class
 * @description Extends GlobalDAO to provide rating-specific database operations
 * @class RatingDAO
 * @extends {GlobalDAO<IRating>}
 */
class RatingDAO extends GlobalDAO<IRating> {
    /**
     * RatingDAO constructor
     * @description Initializes the RatingDAO with the Rating model
     * @constructor
     */
    constructor() {
        super(Rating);
    }

    /**
     * Create or update a rating for a movie by a user
     * @description Creates a new rating if it doesn't exist, or updates it if it does
     * @param {string} userId - The user ID
     * @param {string} movieId - The movie ID
     * @param {1|2|3|4|5} stars - The rating value (1-5 stars)
     * @returns {Promise<IRating>} Created or updated rating
     */
    async createOrUpdateRating(userId: string, movieId: string, stars: 1|2|3|4|5): Promise<IRating> {
        try {
            const rating = await Rating.findOneAndUpdate(
                { userId, movieId },
                { stars, updatedAt: new Date() },
                { new: true, upsert: true, runValidators: true }
            );
            
            return rating;
        } catch (error) {
            throw new Error(`Error creating or updating rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get rating by user and movie
     * @description Retrieves a specific rating made by a user for a movie
     * @param {string} userId - The user ID
     * @param {string} movieId - The movie ID
     * @returns {Promise<IRating | null>} Rating if found, null otherwise
     */
    async getRatingByUserAndMovie(userId: string, movieId: string): Promise<IRating | null> {
        try {
            return await Rating.findOne({ userId, movieId })
                .populate('userId', 'username email')
                .exec();
        } catch (error) {
            throw new Error(`Error fetching rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get average rating for a movie
     * @description Calculates the average rating (1-5 stars) for a specific movie
     * @param {string} movieId - The movie ID
     * @returns {Promise<Object>} Object containing average rating, total count, and rating distribution
     */
    async getAverageRatingByMovie(movieId: string): Promise<{
        average: number;
        totalRatings: number;
        distribution: { [key: number]: number };
    }> {
        try {
            const ratings = await Rating.find({ movieId }).select('stars').exec();
            
            if (ratings.length === 0) {
                return {
                    average: 0,
                    totalRatings: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            const totalStars = ratings.reduce((sum, rating) => sum + rating.stars, 0);
            const average = totalStars / ratings.length;

            // Calculate distribution
            const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratings.forEach(rating => {
                distribution[rating.stars]++;
            });

            return {
                average: Math.round(average * 10) / 10, // Round to 1 decimal place
                totalRatings: ratings.length,
                distribution
            };
        } catch (error) {
            throw new Error(`Error calculating average rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all ratings for a movie
     * @description Retrieves all ratings for a specific movie with pagination
     * @param {string} movieId - The movie ID
     * @param {number} page - Page number
     * @param {number} limit - Ratings per page
     * @returns {Promise<Object>} Ratings with pagination info
     */
    async getRatingsByMovie(movieId: string, page: number = 1, limit: number = 10): Promise<{
        ratings: IRating[];
        totalPages: number;
        currentPage: number;
        totalRatings: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            const ratings = await Rating.find({ movieId })
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            
            const total = await Rating.countDocuments({ movieId });
            
            return {
                ratings,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalRatings: total
            };
        } catch (error) {
            throw new Error(`Error fetching ratings by movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update a rating
     * @description Updates an existing rating
     * @param {string} ratingId - Rating ID
     * @param {string} userId - User ID (for authorization)
     * @param {1|2|3|4|5} stars - New rating value
     * @returns {Promise<IRating | null>} Updated rating
     */
    async updateRating(ratingId: string, userId: string, stars: 1|2|3|4|5): Promise<IRating | null> {
        try {
            const rating = await Rating.findOneAndUpdate(
                { _id: ratingId, userId },
                { stars, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).populate('userId', 'username email');
            
            if (!rating) {
                throw new Error('Rating not found or unauthorized');
            }
            
            return rating;
        } catch (error) {
            throw new Error(`Error updating rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a rating
     * @description Deletes a rating
     * @param {string} ratingId - Rating ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<IRating | null>} Deleted rating
     */
    async deleteRating(ratingId: string, userId: string): Promise<IRating | null> {
        try {
            const rating = await Rating.findOneAndDelete({ 
                _id: ratingId, 
                userId 
            });
            
            if (!rating) {
                throw new Error('Rating not found or unauthorized');
            }
            
            return rating;
        } catch (error) {
            throw new Error(`Error deleting rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * RatingDAO singleton instance
 * @description Exports a single instance of RatingDAO for use throughout the application
 * @type {RatingDAO}
 */
export default new RatingDAO();

