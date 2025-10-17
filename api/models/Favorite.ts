import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
}, { timestamps: true, collection: 'favorites' });

favoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);


