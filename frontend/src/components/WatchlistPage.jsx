import { useState, useEffect } from 'react';
import { getWatchlist, removeFromWatchlist } from '../services/api';

function WatchlistPage({ onClose, onMovieRemoved }) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const data = await getWatchlist();
            setMovies(data);
        } catch (error) {
            console.error('Failed to fetch watchlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (tmdbId) => {
        try {
            await removeFromWatchlist(tmdbId);
            setMovies(prev => prev.filter(movie => movie.tmdbId !== tmdbId));
            onMovieRemoved(tmdbId);
        } catch (error) {
            console.error('Remove error:', error);
        }
    };

    return (
        <div className="watchlist-page">
            <div className="watchlist-header">
                <h2>🎬 My Watchlist</h2>
                <button className="watchlist-close" onClick={onClose}>✕</button>
            </div>

            {isLoading ? (
                <div className="watchlist-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your watchlist...</p>
                </div>
            ) : movies.length === 0 ? (
                <div className="watchlist-empty">
                    <p>Your watchlist is empty</p>
                    <p className="watchlist-hint">Save movies from recommendations or trending to watch later!</p>
                </div>
            ) : (
                <div className="watchlist-grid">
                    {movies.map((movie) => (
                        <div key={movie.tmdbId} className="watchlist-card">
                            {movie.poster ? (
                                <img src={movie.poster} alt={movie.title} />
                            ) : (
                                <div className="watchlist-poster-empty">🎬</div>
                            )}
                            <div className="watchlist-info">
                                <h4>{movie.title}</h4>
                                <div className="watchlist-meta">
                                    {movie.year && <span>{movie.year}</span>}
                                    {movie.rating && <span>★ {movie.rating.toFixed(1)}</span>}
                                </div>
                                <p className="watchlist-overview">{movie.overview}</p>
                                <div className="watchlist-actions">
                                    {movie.trailer ? (
                                        <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="trailer-button">
                                            ▶ Trailer
                                        </a>
                                    ) : (
                                        <a href={'https://www.google.com/search?q=' + encodeURIComponent(movie.title + ' movie trailer')} target="_blank" rel="noopener noreferrer" className="trailer-button">
                                            🔍 Look Up
                                        </a>
                                    )}
                                    <button className="remove-button" onClick={() => handleRemove(movie.tmdbId)}>
                                        ✕ Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WatchlistPage;