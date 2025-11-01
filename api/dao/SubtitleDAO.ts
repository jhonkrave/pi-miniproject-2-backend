/**
 * @fileoverview Subtitle Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides CRUD operations for subtitle documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */

import GlobalDAO from './GlobalDAO';
import Subtitle, { ISubtitle, SubtitleLanguage } from '../models/Subtitle';

/**
 * Subtitle Data Access Object class
 * @description Extends GlobalDAO to provide subtitle-specific database operations
 * @class SubtitleDAO
 * @extends {GlobalDAO<ISubtitle>}
 */
class SubtitleDAO extends GlobalDAO<ISubtitle> {
    /**
     * SubtitleDAO constructor
     * @description Initializes the SubtitleDAO with the Subtitle model
     * @constructor
     */
    constructor() {
        super(Subtitle);
    }

    /**
     * Get subtitles by movie ID
     * @description Retrieves all subtitles available for a specific movie
     * @param {string} movieId - The movie ID (TMDB ID)
     * @returns {Promise<ISubtitle[]>} Array of subtitles for the movie
     */
    async getSubtitlesByMovie(movieId: string): Promise<ISubtitle[]> {
        try {
            return await Subtitle.find({ movieId })
                .sort({ language: 1 })
                .exec();
        } catch (error) {
            throw new Error(`Error fetching subtitles by movie: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get subtitle by movie ID and language
     * @description Retrieves a specific subtitle for a movie in a given language
     * @param {string} movieId - The movie ID (TMDB ID)
     * @param {SubtitleLanguage} language - The subtitle language ('es' or 'en')
     * @returns {Promise<ISubtitle | null>} Subtitle if found, null otherwise
     */
    async getSubtitleByMovieAndLanguage(movieId: string, language: SubtitleLanguage): Promise<ISubtitle | null> {
        try {
            return await Subtitle.findOne({ movieId, language }).exec();
        } catch (error) {
            throw new Error(`Error fetching subtitle by movie and language: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create or update a subtitle
     * @description Creates a new subtitle if it doesn't exist, or updates it if it does
     * @param {string} movieId - The movie ID (TMDB ID)
     * @param {SubtitleLanguage} language - The subtitle language ('es' or 'en')
     * @param {string} url - The subtitle file URL (.vtt file or remote track URL)
     * @param {string} [label] - Optional human-readable label (defaults based on language)
     * @param {boolean} [isDefault=false] - Whether this subtitle is the default one
     * @returns {Promise<ISubtitle>} Created or updated subtitle
     */
    async createOrUpdateSubtitle(
        movieId: string, 
        language: SubtitleLanguage, 
        url: string, 
        label?: string, 
        isDefault: boolean = false
    ): Promise<ISubtitle> {
        try {
            const defaultLabel = label || (language === 'es' ? 'Spanish' : 'English');
            
            const subtitle = await Subtitle.findOneAndUpdate(
                { movieId, language },
                { 
                    url, 
                    label: defaultLabel,
                    isDefault,
                    updatedAt: new Date() 
                },
                { new: true, upsert: true, runValidators: true }
            );
            
            return subtitle;
        } catch (error) {
            throw new Error(`Error creating or updating subtitle: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a subtitle
     * @description Deletes a subtitle for a movie in a given language
     * @param {string} movieId - The movie ID (TMDB ID)
     * @param {SubtitleLanguage} language - The subtitle language ('es' or 'en')
     * @returns {Promise<ISubtitle | null>} Deleted subtitle if found, null otherwise
     */
    async deleteSubtitle(movieId: string, language: SubtitleLanguage): Promise<ISubtitle | null> {
        try {
            return await Subtitle.findOneAndDelete({ movieId, language });
        } catch (error) {
            throw new Error(`Error deleting subtitle: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Check if subtitles exist for a movie
     * @description Verifies if any subtitles are available for a specific movie
     * @param {string} movieId - The movie ID (TMDB ID)
     * @returns {Promise<boolean>} True if subtitles exist, false otherwise
     */
    async hasSubtitles(movieId: string): Promise<boolean> {
        try {
            const count = await Subtitle.countDocuments({ movieId });
            return count > 0;
        } catch (error) {
            throw new Error(`Error checking subtitles availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * SubtitleDAO singleton instance
 * @description Exports a single instance of SubtitleDAO for use throughout the application
 * @type {SubtitleDAO}
 */
export default new SubtitleDAO();

