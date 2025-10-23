const Movie = require('../models/Movie');

class MovieDAO {
  static async addToFavorites(movieData) {
    try {
      const movie = new Movie(movieData);
      await movie.save();
      return movie;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('La película ya está en favoritos');
      }
      throw error;
    }
  }

  static async getUserFavorites(userId) {
    return await Movie.find({ userId }).sort({ createdAt: -1 });
  }

  static async removeFromFavorites(movieId, userId) {
    const result = await Movie.findOneAndDelete({ 
      movieId: movieId, 
      userId: userId 
    });
    
    if (!result) {
      throw new Error('Película no encontrada en favoritos');
    }
    
    return result;
  }

  static async isMovieInFavorites(movieId, userId) {
    const movie = await Movie.findOne({ movieId, userId });
    return !!movie;
  }
}

module.exports = MovieDAO;