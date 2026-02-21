const { getTrending, searchMovies } = require('../services/tmdbService');

exports.getTrending = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await getTrending(page);

        res.status(200).json({
            movies: data.movies,
            page: data.page,
            totalPages: data.totalPages
        });
    } catch (error) {
        next(error);
    }
};

exports.searchMovies = async (req, res, next) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const data = await searchMovies(query, page);

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};