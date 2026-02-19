import React from 'react';

function MovieCard({ movie }) {
    return (
        <div className="movie-card">
            <div className="movie-card-header">
                <h3 className="movie-title">{movie.title}</h3>
                <span className="movie-year">{movie.year}</span>
            </div>
            <div className="movie-card-body">
                <div className="movie-meta">
                    <span className="meta-tag genre-tag">{movie.genre}</span>
                    <span className="meta-tag rating-tag">&#9733; {movie.rating}</span>
                    <span className="meta-tag runtime-tag">{movie.runtime}</span>
                </div>
                <p className="movie-director">
                    <strong>Director:</strong> {movie.director}
                </p>
                <p className="movie-plot">{movie.plot}</p>
                <div className="movie-why">
                    <span className="why-label">Why this movie:</span>
                    <p className="why-text">{movie.why}</p>
                </div>
            </div>
        </div>
    );
}

export default MovieCard;