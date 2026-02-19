const { getTrending } = require('../services/tmdbService');

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