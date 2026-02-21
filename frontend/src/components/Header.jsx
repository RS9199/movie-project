function Header({ onClearHistory, user, onLogout, onLoginClick, onWatchlistClick }) {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <span className="header-icon">🎬</span>
                    <h1>MovisionAI</h1>
                </div>
                <div className="header-actions">
                    {user && (
                        <span className="header-user">Hello, {user.name}</span>
                    )}
                    {user && (
                        <button className="watchlist-nav-button" onClick={onWatchlistClick}>
                            🔖 My Watchlist
                        </button>
                    )}
                    <button className="clear-button" onClick={onClearHistory}>
                        New Conversation
                    </button>
                    {user ? (
                        <button className="logout-button" onClick={onLogout}>
                            Logout
                        </button>
                    ) : (
                        <button className="login-button" onClick={onLoginClick}>
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;