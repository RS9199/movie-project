const mongoose = require('mongoose');

const watchedSchema = new mongoose.Schema({
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
    genre: String,
    watchedAt: {
        type: Date,
        default: Date.now
    }
});

watchedSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Watched', watchedSchema);