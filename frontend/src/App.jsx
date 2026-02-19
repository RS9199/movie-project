import { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MovieList from './components/MovieList';
import LoadingSpinner from './components/LoadingSpinner';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import {
    getRecommendations,
    clearHistory,
    login,
    register,
    logout,
    getMe
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

    useEffect(() => {
        handleGoogleCallback();
        checkAuth();
    }, []);

    const handleGoogleCallback = () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);

            const userData = {
                id: params.get('id'),
                name: params.get('name'),
                email: params.get('email'),
                role: params.get('role')
            };

            setUser(userData);
            window.history.replaceState({}, '', '/');
        }
    };

    const checkAuth = async () => {
        try {
            const data = await getMe();
            setUser(data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setIsCheckingAuth(false);
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

    const handleClearHistory = async () => {
        try {
            await clearHistory();
            setMovies([]);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
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

    if (showAuth) {
        return (
            <div className="app">
                {authPage === 'login' ? (
                    <LoginForm
                        onLogin={handleLogin}
                        onSwitchToRegister={() => setAuthPage('register')}
                        onClose={() => setShowAuth(false)}
                    />
                ) : (
                    <RegisterForm
                        onRegister={handleRegister}
                        onSwitchToLogin={() => setAuthPage('login')}
                        onClose={() => setShowAuth(false)}
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
            />
            <main className="main-content">
                {movies.length === 0 && !isLoading && !error && (
                    <div className="welcome-message">
                        <h2>{user ? 'Welcome, ' + user.name + '!' : 'Welcome to MovieMind AI'}</h2>
                        <p>Tell me what kind of movies you enjoy, and I will recommend
                            some great picks for you!</p>
                        <p className="welcome-hint">Try something like: "I love sci-fi movies
                            with mind-bending plots" or "Suggest some feel-good comedies"</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && <LoadingSpinner />}

                <MovieList movies={movies} />

                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </main>
        </div>
    );
}

export default App;