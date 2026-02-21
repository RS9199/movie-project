function MovieCard({ movie, user, savedMovies, onSave, watchedMovies, onWatched }) {
    const isSaved = savedMovies && savedMovies.includes(movie.tmdbId);
    const isWatched = watchedMovies && watchedMovies.includes(movie.tmdbId);

    return (
        <div className="movie-card">
            <div className="movie-card-inner">
                {movie.poster ? (
                    <div className="movie-poster">
                        <img src={movie.poster} alt={movie.title} />
                        {movie.rating && (
                            <div className="movie-rating-badge">
                                ★ {movie.rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="movie-poster movie-poster-empty">
                        <span>🎬</span>
                    </div>
                )}
                <div className="movie-info">
                    <div className="movie-card-header">
                        <h3 className="movie-title">{movie.title}</h3>
                        {movie.year && <span className="movie-year">{movie.year}</span>}
                    </div>
                    <div className="movie-meta">
                        {movie.genre && <span className="meta-tag genre-tag">{movie.genre}</span>}
                        {movie.runtime && <span className="meta-tag runtime-tag">{movie.runtime}</span>}
                    </div>
                    {movie.director && (
                        <p className="movie-director">
                            <strong>Director:</strong> {movie.director}
                        </p>
                    )}
                    <p className="movie-plot">
                        {movie.description || movie.plot || movie.overview}
                    </p>
                    {movie.why && (
                        <div className="movie-why">
                            <span className="why-label">Why this movie:</span>
                            <p className="why-text">{movie.why}</p>
                        </div>
                    )}
                    <div className="movie-actions">
                        {movie.trailer ? (
                            <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="trailer-button">
                                ▶ Watch Trailer
                            </a>
                        ) : (
                            <a href={'https://www.google.com/search?q=' + encodeURIComponent(movie.title + ' movie trailer')} target="_blank" rel="noopener noreferrer" className="trailer-button">
                                🔍 Look Up
                            </a>
                        )}
                        <button
                            className={'watchlist-button' + (isSaved ? ' saved' : '')}
                            onClick={() => onSave(movie)}
                            disabled={isSaved || !movie.tmdbId}
                        >
                            {isSaved ? '✓ Saved' : !movie.tmdbId ? '🔖 N/A' : '🔖 Save'}
                        </button>
                        <button
                            className={'watched-button' + (isWatched ? ' watched' : '')}
                            onClick={() => onWatched(movie)}
                            disabled={isWatched || !movie.tmdbId}
                        >
                            {isWatched ? '✓ Watched' : !movie.tmdbId ? '👁 N/A' : '👁 Watched'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieCard;