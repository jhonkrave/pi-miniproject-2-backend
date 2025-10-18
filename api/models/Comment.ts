import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true, collection: 'comments' });

export default mongoose.model<IComment>('Comment', commentSchema);


