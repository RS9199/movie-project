import MovieCard from './MovieCard';

function MovieList({ movies }) {
    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="movie-list">
            {movies.map((movie, index) => (
                <MovieCard key={index} movie={movie} />
            ))}
        </div>
    );
}

export default MovieList;