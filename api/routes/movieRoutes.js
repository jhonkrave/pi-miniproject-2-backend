// routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación
router.use(authMiddleware);

// Obtener películas favoritas del usuario
router.get('/favorites', async (req, res) => {
  try {
    console.log('User ID from middleware:', req.userId); // Para debug
    const favorites = await Movie.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message
    });
  }
});

// Agregar película a favoritos
router.post('/favorites', async (req, res) => {
  try {
    console.log('User ID from middleware:', req.userId); // Para debug
    const { movieId, title, overview, releaseDate, posterPath, backdropPath, rating, genreIds } = req.body;
    
    // Verificar si ya existe
    const existingMovie = await Movie.findOne({ 
      movieId: movieId, 
      userId: req.userId 
    });
    
    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: 'La película ya está en favoritos'
      });
    }

    const movie = new Movie({
      movieId,
      title,
      overview,
      releaseDate,
      posterPath,
      backdropPath,
      rating,
      genreIds,
      userId: req.userId
    });

    await movie.save();
    
    res.status(201).json({
      success: true,
      message: 'Película agregada a favoritos',
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar a favoritos',
      error: error.message
    });
  }
});

// Eliminar película de favoritos
router.delete('/favorites/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await Movie.findOneAndDelete({ 
      movieId: movieId, 
      userId: req.userId 
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada en favoritos'
      });
    }
    
    res.json({
      success: true,
      message: 'Película eliminada de favoritos'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar de favoritos',
      error: error.message
    });
  }
});

// Verificar si una película está en favoritos
router.get('/favorites/check/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const existingMovie = await Movie.findOne({ 
      movieId: movieId, 
      userId: req.userId 
    });
    
    res.json({
      success: true,
      data: { isFavorite: !!existingMovie }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar favorito',
      error: error.message
    });
  }
});

module.exports = router;