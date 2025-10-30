"use strict";
/**
 * @fileoverview TMDB service utilities
 * @description Helpers to interact with The Movie Database (TMDB) API v3/v4
 * providing catalog, search, genres and details. Automatically supports
 * API Key (v3) or Read Access Token (v4) via environment variables.
 * @author Equipo 8
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTMDBMovie = mapTMDBMovie;
exports.getPopular = getPopular;
exports.searchMovies = searchMovies;
exports.discoverByGenre = discoverByGenre;
exports.getMovieDetails = getMovieDetails;
exports.getGenres = getGenres;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
/**
 * TMDB API fetch wrapper supporting API Key (v3) or Read Token (v4)
 * @param endpoint e.g. '/movie/popular'
 * @param params URL params map
 */
async function tmdbFetch(endpoint, params = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    const language = params.language || process.env.TMDB_LANGUAGE || 'en-US';
    // Remove undefined params and append
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== 'language')
            cleanParams[key] = String(value);
    });
    // Prefer API Key as query param (v3). If not present, use v4 Bearer token.
    const apiKey = process.env.TMDB_API_KEY;
    const readToken = process.env.TMDB_READ_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN;
    if (apiKey) {
        url.searchParams.set('api_key', apiKey);
    }
    url.searchParams.set('language', language);
    Object.entries(cleanParams).forEach(([k, v]) => url.searchParams.set(k, v));
    const headers = {};
    if (!apiKey && readToken) {
        headers['Authorization'] = `Bearer ${readToken}`;
    }
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`TMDB request failed: ${res.status} ${res.statusText} - ${body}`);
    }
    return await res.json();
}
/**
 * Build TMDB image URL
 */
function img(path, size = 'w500') {
    if (!path)
        return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
}
/**
 * Normalize TMDB movie into CatalogMovie
 */
function mapTMDBMovie(movie) {
    const releaseDate = movie.release_date || movie.first_air_date || null;
    const year = releaseDate ? releaseDate.split('-')[0] : null;
    return {
        id: Number(movie.id),
        title: String(movie.title || movie.name || ''),
        overview: String(movie.overview || ''),
        releaseDate,
        year,
        posterUrl: img(movie.poster_path, 'w500'),
        backdropUrl: img(movie.backdrop_path, 'w780'),
        genreIds: Array.isArray(movie.genre_ids) ? movie.genre_ids : (Array.isArray(movie.genres) ? movie.genres.map((g) => Number(g.id)) : []),
        voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average : null,
    };
}
/**
 * Get popular movies
 */
async function getPopular(page = 1, language) {
    const data = await tmdbFetch('/movie/popular', { page, language, include_adult: false });
    return {
        page: Number(data.page || page),
        totalPages: Number(data.total_pages || 1),
        movies: (data.results || []).map(mapTMDBMovie),
    };
}
/**
 * Search movies by text
 */
async function searchMovies(query, page = 1, language) {
    const data = await tmdbFetch('/search/movie', { query, page, language, include_adult: false });
    return {
        page: Number(data.page || page),
        totalPages: Number(data.total_pages || 1),
        movies: (data.results || []).map(mapTMDBMovie),
    };
}
/**
 * Discover movies by genre
 */
async function discoverByGenre(genreId, page = 1, language) {
    const data = await tmdbFetch('/discover/movie', { with_genres: genreId, page, language, include_adult: false, sort_by: 'popularity.desc' });
    return {
        page: Number(data.page || page),
        totalPages: Number(data.total_pages || 1),
        movies: (data.results || []).map(mapTMDBMovie),
    };
}
/**
 * Get movie details
 */
async function getMovieDetails(id, language) {
    const data = await tmdbFetch(`/movie/${id}`, { language });
    return mapTMDBMovie(data);
}
/**
 * Get TMDB genres list
 */
async function getGenres(language) {
    const data = await tmdbFetch('/genre/movie/list', { language });
    return (data.genres || []).map((g) => ({ id: Number(g.id), name: String(g.name) }));
}
