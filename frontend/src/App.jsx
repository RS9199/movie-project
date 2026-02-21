import { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MovieList from './components/MovieList';
import LoadingSpinner from './components/LoadingSpinner';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import WatchlistPage from './components/WatchlistPage';
import WatchedPage from './components/WatchedPage';

import {
    getRecommendations,
    clearHistory,
    login,
    register,
    logout,
    getMe,
    getTrending,
    addToWatchlist,
    getWatchlist,
    addToWatched,
    getWatched
} from './services/api';
import './App.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [authPage, setAuthPage] = useState('login');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [resetToken, setResetToken] = useState(null);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingPage, setTrendingPage] = useState(1);
    const [trendingTotalPages, setTrendingTotalPages] = useState(1);
    const [savedMovies, setSavedMovies] = useState([]);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [showWatched, setShowWatched] = useState(false);


    useEffect(() => {
        handleUrlParams();
        checkAuth();
        fetchTrending();
    }, []);

    const handleUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const verified = params.get('verified');
        const path = window.location.pathname;

        if (token) {
            localStorage.setItem('token', token);

            const userData = {
                id: params.get('id'),
                name: params.get('name'),
                email: params.get('email'),
                role: params.get('role')
            };

            setUser(userData);
        }

        if (verified === 'true') {
            alert('Email verified successfully! You can now enjoy all features.');
        } else if (verified === 'error') {
            alert('Verification link is invalid or expired.');
        }

        if (path.startsWith('/reset-password/')) {
            const resetToken = path.split('/reset-password/')[1];
            setResetToken(resetToken);
        }

        window.history.replaceState({}, '', '/');
    };

    const checkAuth = async () => {
        try {
            const data = await getMe();
            setUser(data.user);
            fetchWatchlist();
            fetchWatched();
        } catch (err) {
            setUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const fetchTrending = async (page = 1) => {
        try {
            const data = await getTrending(page);
            if (page === 1) {
                setTrendingMovies(data.movies);
            } else {
                setTrendingMovies(prev => [...prev, ...data.movies]);
            }
            setTrendingPage(data.page);
            setTrendingTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch trending:', err);
        }
    };

    const fetchWatchlist = async () => {
        try {
            const data = await getWatchlist();
            setSavedMovies(data.map(movie => movie.tmdbId));
        } catch (err) {
            console.error('Failed to fetch watchlist:', err);
        }
    };

    const handleSaveMovie = async (movie) => {
        if (!user) {
            alert('Please sign in to save movies');
            return;
        }

        if (savedMovies.includes(movie.tmdbId)) {
            return;
        }

        try {
            await addToWatchlist({
                tmdbId: movie.tmdbId,
                title: movie.title,
                poster: movie.poster,
                rating: movie.rating,
                year: movie.year,
                overview: movie.overview,
                trailer: movie.trailer,
                backdrop: movie.backdrop
            });
            setSavedMovies(prev => [...prev, movie.tmdbId]);
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleWatchedMovie = async (movie) => {
        if (!user) {
            alert('Please sign in to mark movies as watched');
            return;
        }

        if (!movie.tmdbId) {
            return;
        }

        if (watchedMovies.includes(movie.tmdbId)) {
            return;
        }

        try {
            await addToWatched({
                tmdbId: movie.tmdbId,
                title: movie.title,
                poster: movie.poster,
                rating: movie.rating,
                year: movie.year,
                overview: movie.overview,
                trailer: movie.trailer,
                backdrop: movie.backdrop,
                genre: movie.genre
            });
            setWatchedMovies(prev => [...prev, movie.tmdbId]);
        } catch (error) {
            console.error('Watched error:', error);
        }
    };

    const handleLogin = async (email, password) => {
        const data = await login(email, password);
        setUser(data.user);
        setShowAuth(false);
    };

    const handleRegister = async (name, email, password) => {
        const data = await register(name, email, password);
        setUser(data.user);
        setShowAuth(false);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setMovies([]);
        setError(null);
    };

    const handleSendMessage = async (message) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getRecommendations(message);
            setMovies(data.recommendations);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWatched = async () => {
        try {
            const data = await getWatched();
            setWatchedMovies(data.map(movie => movie.tmdbId));
        } catch (err) {
            console.error('Failed to fetch watched:', err);
        }
    };

    const handleClearHistory = async () => {
        try {
            await clearHistory();
            setMovies([]);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMovieRemoved = (tmdbId) => {
        setSavedMovies(prev => prev.filter(id => id !== tmdbId));
    };

    const handleWatchedRemoved = (tmdbId) => {
        setWatchedMovies(prev => prev.filter(id => id !== tmdbId));
    };

    if (isCheckingAuth) {
        return (
            <div className="app">
                <div className="auth-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (resetToken) {
        return (
            <div className="app">
                <ResetPasswordForm
                    token={resetToken}
                    onSuccess={() => {
                        setResetToken(null);
                        setShowAuth(true);
                        setAuthPage('login');
                        alert('Password reset successful! You can now sign in.');
                    }}
                />
            </div>
        );
    }

    if (showAuth) {
        return (
            <div className="app">
                {authPage === 'login' ? (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setAuthPage('register')}
                        onForgotPassword={() => setAuthPage('forgot')}
                        onClose={() => setShowAuth(false)}
                    />
                ) : authPage === 'register' ? (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setAuthPage('login')}
                        onClose={() => setShowAuth(false)}
                    />
                ) : (
                    <ForgotPasswordForm
                        onBack={() => setAuthPage('login')}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="app">
            <Header
                onClearHistory={handleClearHistory}
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => setShowAuth(true)}
                onWatchlistClick={() => setShowWatchlist(true)}
                onWatchedClick={() => setShowWatched(true)}

            />
            <main className="main-content">
                {showWatchlist ? (
                    <WatchlistPage
                        onClose={() => setShowWatchlist(false)}
                        onMovieRemoved={handleMovieRemoved}
                    />
                ) : showWatched ? (
                    <WatchedPage
                        onClose={() => setShowWatched(false)}
                        onMovieRemoved={handleWatchedRemoved}
                    />
                ) : (
                    <>
                        {movies.length === 0 && !isLoading && !error && (
                            <div className="welcome-section">
                                <div className="welcome-message">
                                    <h2>{user ? 'Welcome, ' + user.name + '!' : 'Welcome to MovisionAI'}</h2>
                                    <p>Tell me what kind of movies you enjoy, and I will recommend
                                        some great picks for you!</p>
                                    <p className="welcome-hint">Try something like: "I love sci-fi movies
                                        with mind-bending plots" or "Suggest some feel-good comedies"</p>
                                </div>

                                {trendingMovies.length > 0 && (
                                    <div className="trending-section">
                                        <h2 className="trending-title">🔥 Trending This Week</h2>
                                        <div className="trending-grid">
                                            {trendingMovies.map((movie) => (
                                                <div key={movie.tmdbId} className="trending-card">
                                                    {movie.poster ? (
                                                        <img src={movie.poster} alt={movie.title} />
                                                    ) : (
                                                        <div className="trending-poster-empty">🎬</div>
                                                    )}
                                                    <div className="trending-info">
                                                        <h4>{movie.title}</h4>
                                                        <div className="trending-meta">
                                                            {movie.year && <span>{movie.year}</span>}
                                                            {movie.rating && <span>★ {movie.rating.toFixed(1)}</span>}
                                                        </div>
                                                    </div>
                                                    {movie.trailer && (
                                                        <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="trending-trailer">
                                                            ▶
                                                        </a>
                                                    )}
                                                    <button
                                                        className={'trending-save' + (savedMovies.includes(movie.tmdbId) ? ' saved' : '')}
                                                        onClick={() => handleSaveMovie(movie)}
                                                    >
                                                        {savedMovies.includes(movie.tmdbId) ? '✓' : '🔖'}
                                                    </button>
                                                    <button
                                                        className={'trending-watched' + (watchedMovies.includes(movie.tmdbId) ? ' watched' : '')}
                                                        onClick={() => handleWatchedMovie(movie)}
                                                    >
                                                        {watchedMovies.includes(movie.tmdbId) ? '✓' : '👁'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {trendingPage < trendingTotalPages && (
                                            <button
                                                className="load-more-button"
                                                onClick={() => fetchTrending(trendingPage + 1)}
                                            >
                                                Load More
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <p>{error}</p>
                            </div>
                        )}

                        {isLoading && <LoadingSpinner />}

                        <MovieList movies={movies} user={user} savedMovies={savedMovies} onSave={handleSaveMovie} watchedMovies={watchedMovies} onWatched={handleWatchedMovie} />

                        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                    </>
                )}
            </main>
        </div>
    );
}

export default App;