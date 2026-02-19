import { useState } from 'react';

function ForgotPasswordForm({ onBack }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            const { forgotPassword } = await import('../services/api');
            const data = await forgotPassword(email);
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button className="auth-close" onClick={onBack}>X</button>
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

                {error && (
                    <div className="auth-error">
                        <p>{error}</p>
                    </div>
                )}

                {message && (
                    <div className="auth-success">
                        <p>{message}</p>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="forgot-email">Email</label>
                        <input
                            id="forgot-email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-switch">
                    Remember your password?{' '}
                    <button className="auth-switch-button" onClick={onBack}>
                        Back to Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordForm;