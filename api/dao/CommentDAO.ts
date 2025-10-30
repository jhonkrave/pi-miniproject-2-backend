/**
 * @fileoverview Comment Data Access Object (DAO) for LumiTikx API - miniproject 2
 * @description Provides CRUD operations for comment documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */

import GlobalDAO from './GlobalDAO';
import Comment, { IComment } from '../models/Comment';

/**
 * Comment Data Access Object class
 * @description Extends GlobalDAO to provide comment-specific database operations
 * @class CommentDAO
 * @extends {GlobalDAO<IComment>}
 */
class CommentDAO extends GlobalDAO<IComment> {
    /**
     * CommentDAO constructor
     * @description Initializes the CommentDAO with the Comment model
     * @constructor
     */
    constructor() {
        super(Comment);
    }

    /**
     * Get comments by movie ID with pagination
     * @param {string} movieId - The movie ID
     * @param {number} page - Page number
     * @param {number} limit - Comments per page
     * @returns {Promise<Object>} Comments with pagination info
     */
    async getCommentsByMovie(movieId: string, page: number = 1, limit: number = 10): Promise<{
        comments: IComment[],
        totalPages: number,
        currentPage: number,
        totalComments: number
    }> {
        try {
            const skip = (page - 1) * limit;
            const comments = await Comment.find({ movieId })
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            
            const total = await Comment.countDocuments({ movieId });
            
            return {
                comments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalComments: total
            };
        } catch (error) {
            throw new Error(`Error fetching comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get comments by user ID with pagination
     * @param {string} userId - The user ID
     * @param {number} page - Page number
     * @param {number} limit - Comments per page
     * @returns {Promise<Object>} User comments with pagination info
     */
    async getCommentsByUser(userId: string, page: number = 1, limit: number = 10): Promise<{
        comments: IComment[],
        totalPages: number,
        currentPage: number,
        totalComments: number
    }> {
        try {
            const skip = (page - 1) * limit;
            const comments = await Comment.find({ userId })
                .populate('movieId', 'title poster_path')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            
            const total = await Comment.countDocuments({ userId });
            
            return {
                comments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalComments: total
            };
        } catch (error) {
            throw new Error(`Error fetching user comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a new comment
     * @param {Partial<IComment>} commentData - Comment data
     * @returns {Promise<IComment>} Created comment
     */
    async createComment(commentData: Partial<IComment>): Promise<IComment> {
        try {
            const comment = new Comment(commentData);
            return await comment.save();
        } catch (error) {
            throw new Error(`Error creating comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update a comment
     * @param {string} commentId - Comment ID
     * @param {string} userId - User ID (for authorization)
     * @param {string} content - New comment content
     * @returns {Promise<IComment | null>} Updated comment
     */
    async updateComment(commentId: string, userId: string, content: string): Promise<IComment | null> {
        try {
            const comment = await Comment.findOneAndUpdate(
                { _id: commentId, userId },
                { content, updatedAt: new Date() },
                { new: true }
            ).populate('userId', 'username email');
            
            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }
            
            return comment;
        } catch (error) {
            throw new Error(`Error updating comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a comment
     * @param {string} commentId - Comment ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<IComment | null>} Deleted comment
     */
    async deleteComment(commentId: string, userId: string): Promise<IComment | null> {
        try {
            const comment = await Comment.findOneAndDelete({ 
                _id: commentId, 
                userId 
            });
            
            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }
            
            return comment;
        } catch (error) {
            throw new Error(`Error deleting comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * CommentDAO singleton instance
 * @description Exports a single instance of CommentDAO for use throughout the application
 * @type {CommentDAO}
 */
export default new CommentDAO();