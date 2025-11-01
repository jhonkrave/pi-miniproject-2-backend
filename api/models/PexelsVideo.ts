/**
 * @fileoverview Pexels Video model for LumiFlix API - MiniProject 2
 * @description Stores Pexels video data in database to avoid rate limiting
 * @author Team 8
 * @version 1.0.0
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Pexels Video interface extending Mongoose Document
 * @interface IPexelsVideo
 * @extends {Document}
 * @property {number} pexelsId - Pexels video ID (unique)
 * @property {Object} videoData - Complete Pexels video object
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */
export interface IPexelsVideo extends Document {
  pexelsId: number;
  videoData: any; // Store complete Pexels video object
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pexels Video schema definition
 * @description Mongoose schema for storing Pexels videos
 * @type {Schema<IPexelsVideo>}
 */
const pexelsVideoSchema = new Schema<IPexelsVideo>({
  /**
   * Pexels video ID (unique identifier)
   * @type {Object}
   */
  pexelsId: { 
    type: Number, 
    required: true, 
    unique: true,
    index: true 
  },
  
  /**
   * Complete Pexels video data object
   * @type {Object}
   */
  videoData: { 
    type: Schema.Types.Mixed, 
    required: true 
  },
}, { 
  /**
   * Schema options
   * @type {Object}
   */
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'pexelsvideos' // Explicit collection name
});

/**
 * Pexels Video model export
 * @description Mongoose model for Pexels video documents
 * @type {Model<IPexelsVideo>}
 */
export default mongoose.model<IPexelsVideo>('PexelsVideo', pexelsVideoSchema);

