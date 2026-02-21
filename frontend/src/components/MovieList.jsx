import MovieCard from './MovieCard';

function MovieList({ movies, user, savedMovies, onSave, watchedMovies, onWatched }) {
    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <div className="movie-list">
            {movies.map((movie, index) => (
                <MovieCard
                    key={index}
                    movie={movie}
                    user={user}
                    savedMovies={savedMovies}
                    onSave={onSave}
                    watchedMovies={watchedMovies}
                    onWatched={onWatched}
                />
            ))}
        </div>
    );
}

export default MovieList;