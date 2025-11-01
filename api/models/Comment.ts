/**
 * @fileoverview Comment model for LumiFlix API - MiniProject 2
 * @description Defines the Mongoose schema and interface for comment documents
 * @author Team 8
 * @version 1.0.0
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Comment interface extending Mongoose Document
 * @interface IComment
 * @extends {Document}
 * @property {Types.ObjectId} userId - User ID who created the comment
 * @property {string} movieId - Movie ID the comment belongs to (TMDB ID as string)
 * @property {string} content - Comment content text
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */
export interface IComment extends Document {
  userId: Types.ObjectId;
  movieId: string; // Using string to store TMDB movie ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment schema definition
 * @description Mongoose schema for comment documents with validation and indexing
 * @type {Schema<IComment>}
 */
const commentSchema = new Schema<IComment>({
  /**
   * User ID reference
   * @type {Object}
   */
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  
  /**
   * Movie ID reference (TMDB ID stored as string)
   * @type {Object}
   */
  movieId: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  /**
   * Comment content
   * @type {Object}
   */
  content: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 2000 
  },
}, { 
  /**
   * Schema options
   * @type {Object}
   */
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'comments' // Explicit collection name
});

/**
 * Comment model export
 * @description Mongoose model for comment documents with IComment interface
 * @type {Model<IComment>}
 */
export default mongoose.model<IComment>('Comment', commentSchema);
