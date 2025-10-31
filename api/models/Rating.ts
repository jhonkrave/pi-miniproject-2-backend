/**
 * @fileoverview Rating model for LumiFlix API - MiniProject 2
 * @description Defines the Mongoose schema and interface for rating documents
 * @author Team 8
 * @version 1.0.0
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Rating interface extending Mongoose Document
 * @interface IRating
 * @extends {Document}
 * @property {Types.ObjectId} userId - User ID who created the rating
 * @property {string} movieId - Movie ID the rating belongs to (TMDB ID as string)
 * @property {1|2|3|4|5} stars - Rating value from 1 to 5 stars
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */
export interface IRating extends Document {
  userId: Types.ObjectId;
  movieId: string; // Using string to store TMDB movie ID
  stars: 1|2|3|4|5;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rating schema definition
 * @description Mongoose schema for rating documents with validation and indexing
 * @type {Schema<IRating>}
 */
const ratingSchema = new Schema<IRating>({
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
   * Rating stars (1-5)
   * @type {Object}
   */
  stars: { 
    type: Number, 
    enum: [1, 2, 3, 4, 5], 
    required: true 
  },
}, { 
  /**
   * Schema options
   * @type {Object}
   */
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'ratings' // Explicit collection name
});

/**
 * Compound unique index to ensure one rating per user per movie
 * @description Prevents duplicate ratings from the same user for the same movie
 */
ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

/**
 * Rating model export
 * @description Mongoose model for rating documents with IRating interface
 * @type {Model<IRating>}
 */
export default mongoose.model<IRating>('Rating', ratingSchema);


