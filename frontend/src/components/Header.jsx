import React from 'react';

function Header({ onClearHistory }) {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <span className="header-icon">🎬</span>
                    <h1>MovieMind AI</h1>
                </div>
                <button className="clear-button" onClick={onClearHistory}>
                    New Conversation
                </button>
            </div>
        </header>
    );
}

export default Header;