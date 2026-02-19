import React from 'react';

function LoadingSpinner() {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Finding perfect movies for you...</p>
        </div>
    );
}

export default LoadingSpinner;