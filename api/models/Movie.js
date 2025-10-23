// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  releaseDate: String,
  posterPath: String,
  backdropPath: String,
  rating: Number,
  genreIds: [Number],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar duplicados
movieSchema.index({ movieId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Movie', movieSchema);