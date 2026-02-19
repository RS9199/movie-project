import { useState } from 'react';

function LoginForm({ onLogin, onSwitchToRegister, onClose, onForgotPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await onLogin(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="auth-close" onClick={onClose}>X</button>
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to get personalized movie recommendations</p>

                {error && (
                    <div className="auth-error">
                        <p>{error}</p>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="auth-switch" style={{ marginTop: '1rem' }}>
                    <button className="auth-switch-button" onClick={onForgotPassword}>
                        Forgot your password?
                    </button>
                </p>
                <div className="auth-divider">
                    <span>or</span>
                </div>

                <button
                    className="google-button"
                    onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}
                >
                    Sign in with Google
                </button>
                <p className="auth-switch">
                    Don't have an account?{' '}
                    <button
                        className="auth-switch-button"
                        onClick={onSwitchToRegister}
                    >
                        Register
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;