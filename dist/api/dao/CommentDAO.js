"use strict";
/**
 * @fileoverview Comment Data Access Object (DAO) for LumiTikx API - miniproject 2
 * @description Provides CRUD operations for comment documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalDAO_1 = __importDefault(require("./GlobalDAO"));
const Comment_1 = __importDefault(require("../models/Comment"));
/**
 * Comment Data Access Object class
 * @description Extends GlobalDAO to provide comment-specific database operations
 * @class CommentDAO
 * @extends {GlobalDAO<IComment>}
 */
class CommentDAO extends GlobalDAO_1.default {
    /**
     * CommentDAO constructor
     * @description Initializes the CommentDAO with the Comment model
     * @constructor
     */
    constructor() {
        super(Comment_1.default);
    }
    /**
     * Get comments by movie ID with pagination
     * @param {string} movieId - The movie ID
     * @param {number} page - Page number
     * @param {number} limit - Comments per page
     * @returns {Promise<Object>} Comments with pagination info
     */
    async getCommentsByMovie(movieId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const comments = await Comment_1.default.find({ movieId })
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            const total = await Comment_1.default.countDocuments({ movieId });
            return {
                comments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalComments: total
            };
        }
        catch (error) {
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
    async getCommentsByUser(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const comments = await Comment_1.default.find({ userId })
                .populate('movieId', 'title poster_path')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            const total = await Comment_1.default.countDocuments({ userId });
            return {
                comments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalComments: total
            };
        }
        catch (error) {
            throw new Error(`Error fetching user comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create a new comment
     * @param {Partial<IComment>} commentData - Comment data
     * @returns {Promise<IComment>} Created comment
     */
    async createComment(commentData) {
        try {
            const comment = new Comment_1.default(commentData);
            return await comment.save();
        }
        catch (error) {
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
    async updateComment(commentId, userId, content) {
        try {
            const comment = await Comment_1.default.findOneAndUpdate({ _id: commentId, userId }, { content, updatedAt: new Date() }, { new: true }).populate('userId', 'username email');
            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }
            return comment;
        }
        catch (error) {
            throw new Error(`Error updating comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete a comment
     * @param {string} commentId - Comment ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<IComment | null>} Deleted comment
     */
    async deleteComment(commentId, userId) {
        try {
            const comment = await Comment_1.default.findOneAndDelete({
                _id: commentId,
                userId
            });
            if (!comment) {
                throw new Error('Comment not found or unauthorized');
            }
            return comment;
        }
        catch (error) {
            throw new Error(`Error deleting comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
/**
 * CommentDAO singleton instance
 * @description Exports a single instance of CommentDAO for use throughout the application
 * @type {CommentDAO}
 */
exports.default = new CommentDAO();
