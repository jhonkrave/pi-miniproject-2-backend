/**
 * @fileoverview Subtitle model for LumiFlix API - MiniProject 2
 * @description Defines the Mongoose schema and interface for subtitle documents
 * @author Team 8
 * @version 1.0.0
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Supported subtitle languages
 * @typedef {'es' | 'en'} SubtitleLanguage
 */
export type SubtitleLanguage = 'es' | 'en';

/**
 * Subtitle interface extending Mongoose Document
 * @interface ISubtitle
 * @extends {Document}
 * @property {Types.ObjectId} movieId - Movie ID the subtitle belongs to (TMDB ID as string)
 * @property {SubtitleLanguage} language - Subtitle language code ('es' for Spanish, 'en' for English)
 * @property {string} url - URL to the subtitle file (.vtt file or remote track URL)
 * @property {string} label - Human-readable label for the subtitle (e.g., "Spanish", "English")
 * @property {boolean} isDefault - Whether this subtitle is the default one for the movie
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */
export interface ISubtitle extends Document {
  movieId: string; // Using string to store TMDB movie ID
  language: SubtitleLanguage;
  url: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subtitle schema definition
 * @description Mongoose schema for subtitle documents with validation and indexing
 * @type {Schema<ISubtitle>}
 */
const subtitleSchema = new Schema<ISubtitle>({
  /**
   * Movie ID (TMDB ID stored as string)
   * @type {Object}
   */
  movieId: { 
    type: String, 
    required: true, 
    index: true 
  },
  
  /**
   * Subtitle language code
   * @type {Object}
   */
  language: { 
    type: String, 
    enum: ['es', 'en'], 
    required: true,
    index: true
  },
  
  /**
   * Subtitle file URL (.vtt file or remote track URL)
   * @type {Object}
   */
  url: { 
    type: String, 
    required: true,
    trim: true
  },
  
  /**
   * Human-readable label for the subtitle
   * @type {Object}
   */
  label: { 
    type: String, 
    required: true,
    trim: true,
    default: function(this: ISubtitle) {
      return this.language === 'es' ? 'Spanish' : 'English';
    }
  },
  
  /**
   * Whether this subtitle is the default one
   * @type {Object}
   */
  isDefault: { 
    type: Boolean, 
    default: false 
  },
}, { 
  /**
   * Schema options
   * @type {Object}
   */
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'subtitles' // Explicit collection name
});

/**
 * Compound unique index to ensure one subtitle per language per movie
 * @description Prevents duplicate subtitles for the same language and movie
 */
subtitleSchema.index({ movieId: 1, language: 1 }, { unique: true });

/**
 * Subtitle model export
 * @description Mongoose model for subtitle documents with ISubtitle interface
 * @type {Model<ISubtitle>}
 */
export default mongoose.model<ISubtitle>('Subtitle', subtitleSchema);

