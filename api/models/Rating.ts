import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRating extends Document {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  stars: 1|2|3|4|5;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  stars: { type: Number, enum: [1,2,3,4,5], required: true },
}, { timestamps: true, collection: 'ratings' });

ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', ratingSchema);


