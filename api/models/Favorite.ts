/**
 * @fileoverview Favorite model for LumiFlix API - miniproject 2
 * @description Defines the schema and interface for favorite documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */
import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Favorite interface extending Mongoose Document
 * @description Defines the structure and types for favorite documents in the database
 * @interface IFavorite
 * @extends {Document}
 */
export interface IFavorite extends Document {
  /** User ID */
  userId: Types.ObjectId;
  /** Movie ID */
  movieId: string;
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * Favorite schema
 * @description Defines the schema for favorite documents in the database
 * @type {Schema<IFavorite>}
 */
const favoriteSchema = new Schema<IFavorite>({
  /** User ID */
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  /** Movie ID */
  movieId: { type: String,  required: true, index: true },
}, { timestamps: true, collection: 'favorites' });

favoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

/**
 * Favorite model export
 * @description Exports the Mongoose model for Favorite documents with IFavorite interface
 * @type {Model<IFavorite>}
 */
export default mongoose.model<IFavorite>('Favorite', favoriteSchema);


