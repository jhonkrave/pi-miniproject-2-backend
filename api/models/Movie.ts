import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description?: string;
  year?: number;
  durationMinutes?: number;
  genres: string[];
  language?: string;
  posterUrl?: string;
  videoUrl?: string;
  provider?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  year: { type: Number, min: 1888 },
  durationMinutes: { type: Number, min: 0 },
  genres: { type: [String], default: [] },
  language: { type: String, default: '' },
  posterUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  provider: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, collection: 'movies' });

export default mongoose.model<IMovie>('Movie', movieSchema);


