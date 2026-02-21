import { useState, useEffect } from 'react';
import { getWatched, getStats, removeFromWatched } from '../services/api';

function WatchedPage({ onClose, onMovieRemoved }) {
    const [movies, setMovies] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [watchedData, statsData] = await Promise.all([
                getWatched(),
                getStats()
            ]);
            setMovies(watchedData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch watched data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (tmdbId) => {
        try {
            await removeFromWatched(tmdbId);
            setMovies(prev => prev.filter(movie => movie.tmdbId !== tmdbId));
            onMovieRemoved(tmdbId);

            // Refetch stats after removing
            const newStats = await getStats();
            setStats(newStats);
        } catch (error) {
            console.error('Remove error:', error);
        }
    };

    return (
        <div className="watched-page">
            <div className="watched-page-header">
                <h2>👁 Watched Movies</h2>
                <button className="watchlist-close" onClick={onClose}>✕</button>
            </div>

            {isLoading ? (
                <div className="watchlist-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    {stats && (
                        <div className="stats-section">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-number">{stats.totalMovies}</span>
                                    <span className="stat-label">Movies Watched</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number">★ {stats.avgRating}</span>
                                    <span className="stat-label">Avg Rating</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-number">{stats.favoriteGenre}</span>
                                    <span className="stat-label">Favorite Genre</span>
                                </div>
                            </div>

                            {stats.topGenres && stats.topGenres.length > 0 && (
                                <div className="genre-breakdown">
                                    <h3>Genre Breakdown</h3>
                                    <div className="genre-bars">
                                        {stats.topGenres.map((item) => (
                                            <div key={item.genre} className="genre-bar-row">
                                                <span className="genre-bar-label">{item.genre}</span>
                                                <div className="genre-bar-track">
                                                    <div
                                                        className="genre-bar-fill"
                                                        style={{ width: (item.count / stats.totalMovies * 100) + '%' }}
                                                    ></div>
                                                </div>
                                                <span className="genre-bar-count">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {movies.length === 0 ? (
                        <div className="watchlist-empty">
                            <p>No watched movies yet</p>
                            <p className="watchlist-hint">Mark movies as watched to track your viewing history!</p>
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
                                            {movie.genre && <span>{movie.genre}</span>}
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
                </>
            )}
        </div>
    );
}

export default WatchedPage;