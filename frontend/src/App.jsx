import { useState } from 'react';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MovieList from './components/MovieList';
import LoadingSpinner from './components/LoadingSpinner';
import { getRecommendations, clearHistory } from './services/api';
import './App.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    return (
        <div className="app">
            <Header onClearHistory={handleClearHistory} />
            <main className="main-content">
                {movies.length === 0 && !isLoading && !error && (
                    <div className="welcome-message">
                        <h2>Welcome to MovieMind AI</h2>
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