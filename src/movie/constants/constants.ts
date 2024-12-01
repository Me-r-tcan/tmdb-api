export const TMDB_API = {
  BASE_URL: 'https://api.themoviedb.org/3',
  DISCOVER_MOVIES: '/discover/movie',
  MOVIE_DETAILS: (id: number) => `/movie/${id}`,
};

export const API_CONFIG = {
  REQUEST_LIMIT: 40,
  RETRY_DELAY: 3000,
};
