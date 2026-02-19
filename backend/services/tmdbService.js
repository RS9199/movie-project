const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';

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
            trailer: trailerUrl
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

module.exports = { searchMovie, enrichMovies };