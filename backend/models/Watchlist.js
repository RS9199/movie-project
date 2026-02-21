const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster: String,
    rating: Number,
    year: String,
    overview: String,
    trailer: String,
    backdrop: String,
    addedAt: {
        type: Date,
        default: Date.now
    }
});

watchlistSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);