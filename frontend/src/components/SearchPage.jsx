import { useState } from 'react';
import { searchTMDB } from '../services/api';

function SearchPage({ onClose, user, savedMovies, onSave, watchedMovies, onWatched }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setSearched(true);
        try {
            const data = await searchTMDB(query, 1);
            setResults(data.movies);
            setPage(data.page);
            setTotalPages(data.totalPages);
            setTotalResults(data.totalResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = async () => {
        setIsLoading(true);
        try {
            const data = await searchTMDB(query, page + 1);
            setResults(prev => [...prev, ...data.movies]);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-page">
            <div className="search-page-header">
                <h2>🔍 Search Movies</h2>
                <button className="watchlist-close" onClick={onClose}>✕</button>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for a movie..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="search-submit" disabled={isLoading}>
                    {isLoading ? '...' : 'Search'}
                </button>
            </form>

            {totalResults > 0 && (
                <p className="search-results-count">{totalResults} results found</p>
            )}

            {searched && results.length === 0 && !isLoading && (
                <div className="watchlist-empty">
                    <p>No movies found for "{query}"</p>
                </div>
            )}

            <div className="search-results">
                {results.map((movie) => (
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
                                {movie.rating > 0 && <span>★ {movie.rating.toFixed(1)}</span>}
                                {movie.genre && <span>{movie.genre}</span>}
                            </div>
                            <p className="watchlist-overview">{movie.overview}</p>
                            <div className="watchlist-actions">
                                {movie.tmdbId && (

                                    <a href={'https://www.google.com/search?q=' + encodeURIComponent(movie.title + ' movie trailer')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="trailer-button"
                                    >
                                    🔍 Look Up
                                    </a>
                                    )}
                                <button
                                    className={'watchlist-button' + (savedMovies && savedMovies.includes(movie.tmdbId) ? ' saved' : '')}
                                    onClick={() => onSave(movie)}
                                    disabled={savedMovies && savedMovies.includes(movie.tmdbId)}
                                >
                                    {savedMovies && savedMovies.includes(movie.tmdbId) ? '✓ Saved' : '🔖 Save'}
                                </button>
                                <button
                                    className={'watched-button' + (watchedMovies && watchedMovies.includes(movie.tmdbId) ? ' watched' : '')}
                                    onClick={() => onWatched(movie)}
                                    disabled={watchedMovies && watchedMovies.includes(movie.tmdbId)}
                                >
                                    {watchedMovies && watchedMovies.includes(movie.tmdbId) ? '✓ Watched' : '👁 Watched'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {page < totalPages && results.length > 0 && (
                <button className="load-more-button" onClick={handleLoadMore} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load More'}
                </button>
            )}
        </div>
    );
}

export default SearchPage;