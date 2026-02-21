const Watchlist = require('../models/Watchlist');

exports.addToWatchlist = async (req, res, next) => {
    try {
        const { tmdbId, title, poster, rating, year, overview, trailer, backdrop } = req.body;

        const existing = await Watchlist.findOne({ user: req.user._id, tmdbId });

        if (existing) {
            return res.status(400).json({ error: 'Movie already in watchlist' });
        }

        const entry = await Watchlist.create({
            user: req.user._id,
            tmdbId,
            title,
            poster,
            rating,
            year,
            overview,
            trailer,
            backdrop
        });

        res.status(201).json(entry);
    } catch (error) {
        next(error);
    }
};

exports.removeFromWatchlist = async (req, res, next) => {
    try {
        const { tmdbId } = req.params;

        const deleted = await Watchlist.findOneAndDelete({
            user: req.user._id,
            tmdbId: tmdbId
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Movie not found in watchlist' });
        }

        res.status(200).json({ message: 'Removed from watchlist' });
    } catch (error) {
        next(error);
    }
};

exports.getWatchlist = async (req, res, next) => {
    try {
        const watchlist = await Watchlist.find({ user: req.user._id })
            .sort({ addedAt: -1 });

        res.status(200).json(watchlist);
    } catch (error) {
        next(error);
    }
};

exports.checkWatchlist = async (req, res, next) => {
    try {
        const { tmdbId } = req.params;

        const exists = await Watchlist.findOne({
            user: req.user._id,
            tmdbId: tmdbId
        });

        res.status(200).json({ inWatchlist: !!exists });
    } catch (error) {
        next(error);
    }
};