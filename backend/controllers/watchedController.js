const Watched = require('../models/Watched');

exports.addToWatched = async (req, res, next) => {
    try {
        const { tmdbId, title, poster, rating, year, overview, trailer, backdrop, genre } = req.body;

        const existing = await Watched.findOne({ user: req.user._id, tmdbId });

        if (existing) {
            return res.status(400).json({ error: 'Movie already marked as watched' });
        }

        const entry = await Watched.create({
            user: req.user._id,
            tmdbId,
            title,
            poster,
            rating,
            year,
            overview,
            trailer,
            backdrop,
            genre
        });

        res.status(201).json(entry);
    } catch (error) {
        next(error);
    }
};

exports.removeFromWatched = async (req, res, next) => {
    try {
        const { tmdbId } = req.params;

        const deleted = await Watched.findOneAndDelete({
            user: req.user._id,
            tmdbId: tmdbId
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Movie not found in watched list' });
        }

        res.status(200).json({ message: 'Removed from watched' });
    } catch (error) {
        next(error);
    }
};

exports.getWatched = async (req, res, next) => {
    try {
        const watched = await Watched.find({ user: req.user._id })
            .sort({ watchedAt: -1 });

        res.status(200).json(watched);
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const watched = await Watched.find({ user: req.user._id });

        const totalMovies = watched.length;

        const avgRating = totalMovies > 0
            ? (watched.reduce((sum, movie) => sum + (movie.rating || 0), 0) / totalMovies).toFixed(1)
            : 0;

        const genreCounts = {};
        watched.forEach(movie => {
            if (movie.genre) {
                const mainGenre = movie.genre.split(',')[0].trim();
                genreCounts[mainGenre] = (genreCounts[mainGenre] || 0) + 1;
            }
        });

        const favoriteGenre = Object.keys(genreCounts).length > 0
            ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b)
            : 'None yet';

        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre, count]) => ({ genre, count }));

        res.status(200).json({
            totalMovies,
            avgRating: parseFloat(avgRating),
            favoriteGenre,
            topGenres
        });
    } catch (error) {
        next(error);
    }
};