/**
 * @fileoverview Comment routes for LumiFlix API
 */

import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import CommentDAO from '../dao/CommentDAO';

const router = Router();

// Obtener todos los comentarios de una película
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const comments = await CommentDAO.findByMovie(movieId);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Crear comentario (CON AUTENTICACIÓN)
// @ts-ignore
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { movieId, content } = req.body;
    const userId = (req as any).userId;

    console.log('🔐 User ID from auth:', userId);
    console.log('🎬 Movie ID:', movieId);
    console.log('💬 Content:', content);

    if (!movieId || !content) {
      return res.status(400).json({ message: 'Movie ID and content are required' });
    }

    const comment = await CommentDAO.create({ 
      userId, 
      movieId, 
      content 
    });
    
    await comment.populate('userId', 'username email');
    res.status(201).json(comment);
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({ 
      message: 'Error creating comment',
      error: (error as any).message
    });
  }
});

// Actualizar comentario (CON AUTENTICACIÓN)
// @ts-ignore
router.put('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await CommentDAO.update(id, userId.toString(), content);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Eliminar comentario (CON AUTENTICACIÓN)
// @ts-ignore
router.delete('/:id', authMiddleware, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const deleted = await CommentDAO.delete(id, userId.toString());
    if (!deleted) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

export default router;