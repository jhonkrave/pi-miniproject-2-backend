/**
 * @fileoverview TMDB service utilities
 * @description Helpers to interact with The Movie Database (TMDB) API v3/v4
 * providing catalog, search, genres and details. Automatically supports
 * API Key (v3) or Read Access Token (v4) via environment variables.
 * @author Equipo 8
 * @version 1.0.0
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Common movie shape exposed to the frontend
 */
export interface CatalogMovie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string | null;
  year: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  genreIds: number[];
  voteAverage: number | null;
}

/**
 * TMDB API fetch wrapper supporting API Key (v3) or Read Token (v4)
 * @param endpoint e.g. '/movie/popular'
 * @param params URL params map
 */
async function tmdbFetch(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  const language = (params.language as string) || process.env.TMDB_LANGUAGE || 'en-US';

  // Remove undefined params and append
  const cleanParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && key !== 'language') cleanParams[key] = String(value);
  });

  // Prefer API Key as query param (v3). If not present, use v4 Bearer token.
  const apiKey = process.env.TMDB_API_KEY;
  const readToken = process.env.TMDB_READ_TOKEN || process.env.TMDB_READ_ACCESS_TOKEN;

  if (apiKey) {
    url.searchParams.set('api_key', apiKey);
  }

  url.searchParams.set('language', language);
  Object.entries(cleanParams).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {};
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
function img(path: string | null | undefined, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Normalize TMDB movie into CatalogMovie
 */
export function mapTMDBMovie(movie: any): CatalogMovie {
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
    genreIds: Array.isArray(movie.genre_ids) ? movie.genre_ids : (Array.isArray(movie.genres) ? movie.genres.map((g: any) => Number(g.id)) : []),
    voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average : null,
  };
}

/**
 * Get popular movies
 */
export async function getPopular(page: number = 1, language?: string): Promise<{ page: number; totalPages: number; movies: CatalogMovie[]; }>
{
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
export async function searchMovies(query: string, page: number = 1, language?: string): Promise<{ page: number; totalPages: number; movies: CatalogMovie[]; }>
{
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
export async function discoverByGenre(genreId: string | number, page: number = 1, language?: string): Promise<{ page: number; totalPages: number; movies: CatalogMovie[]; }>
{
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
export async function getMovieDetails(id: string | number, language?: string): Promise<CatalogMovie> {
  const data = await tmdbFetch(`/movie/${id}`, { language });
  return mapTMDBMovie(data);
}

/**
 * Get TMDB genres list
 */
export async function getGenres(language?: string): Promise<Array<{ id: number; name: string }>> {
  const data = await tmdbFetch('/genre/movie/list', { language });
  return (data.genres || []).map((g: any) => ({ id: Number(g.id), name: String(g.name) }));
}


