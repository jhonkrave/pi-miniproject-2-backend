/**
 * @fileoverview Comment Data Access Object (DAO)
 */

import Comment, { IComment } from '../models/Comment';
import { Types } from 'mongoose';

class CommentDAO {
  async create(commentData: { 
    userId: Types.ObjectId; 
    movieId: string; 
    content: string; 
  }): Promise<IComment> {
    return await Comment.create(commentData);
  }

  async findByMovie(movieId: string): Promise<IComment[]> {
    return await Comment.find({ movieId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(commentId: string, userId: string, content: string): Promise<IComment | null> {
    return await Comment.findOneAndUpdate(
      { _id: commentId, userId }, 
      { content }, 
      { new: true }
    ).exec();
  }

  async delete(commentId: string, userId: string): Promise<boolean> {
    const result = await Comment.findOneAndDelete({ _id: commentId, userId }).exec();
    return result !== null;
  }

  async findById(commentId: string): Promise<IComment | null> {
    return await Comment.findById(commentId).exec();
  }
}

export default new CommentDAO();