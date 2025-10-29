/**
 * @fileoverview Comment model for LumiFlix API - miniproject 2
 * @description Defines the schema and interface for comment documents in the database
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  userId: Types.ObjectId;
  movieId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    movieId: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 500 
    },
  },
  { 
    timestamps: true, 
    collection: 'comments' 
  }
);

// Índices para optimizar búsquedas
commentSchema.index({ movieId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, movieId: 1 });

export default mongoose.model<IComment>('Comment', commentSchema);