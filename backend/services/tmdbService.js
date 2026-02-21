const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';


const GENRE_MAP = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

const getGenres = (genreIds) => {
    if (!genreIds || genreIds.length === 0) return null;
    return genreIds.map(id => GENRE_MAP[id]).filter(Boolean).join(', ');
};

const getTrailer = async (movieId) => {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${process.env.TMDB_API_KEY}`
        );
        const data = await response.json();

        const trailer = data.results.find(
            (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
        return null;
    }
};

const searchMovie = async (movieName) => {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        const movie = data.results[0];
        const trailerUrl = await getTrailer(movie.id);

        return {
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster: movie.poster_path ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${TMDB_IMAGE_URL}/w1280${movie.backdrop_path}` : null,
            rating: movie.vote_average,
            releaseDate: movie.release_date,
            year: movie.release_date ? movie.release_date.split('-')[0] : null,
            trailer: trailerUrl,
            genre: getGenres(movie.genre_ids)
        };
    } catch (error) {
        console.error('TMDB search error for:', movieName, error);
        return null;
    }
};

const enrichMovies = async (movies) => {
    const enrichedMovies = await Promise.all(
        movies.map(async (movie) => {
            const tmdbData = await searchMovie(movie.title);

            if (tmdbData) {
                return {
                    ...movie,
                    ...tmdbData,
                    description: movie.description
                };
            }

            return movie;
        })
    );

    return enrichedMovies;
};


const getTrending = async (page = 1) => {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}&page=${page}`
        );
        const data = await response.json();

        const movies = await Promise.all(
            data.results.map(async (movie) => {
                const trailerUrl = await getTrailer(movie.id);
                return {
                    tmdbId: movie.id,
                    title: movie.title,
                    overview: movie.overview,
                    poster: movie.poster_path ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}` : null,
                    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_URL}/w1280${movie.backdrop_path}` : null,
                    rating: movie.vote_average,
                    releaseDate: movie.release_date,
                    year: movie.release_date ? movie.release_date.split('-')[0] : null,
                    trailer: trailerUrl,
                    genre: getGenres(movie.genre_ids)
                };
            })
        );

        return {
            movies,
            page: data.page,
            totalPages: data.total_pages
        };
    } catch (error) {
        console.error('TMDB trending error:', error);
        return { movies: [], page: 1, totalPages: 1 };
    }
};
module.exports = { searchMovie, enrichMovies, getTrending };
