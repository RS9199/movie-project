const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const auth = require('../middleware/auth');

router.post('/', auth, watchlistController.addToWatchlist);
router.delete('/:tmdbId', auth, watchlistController.removeFromWatchlist);
router.get('/', auth, watchlistController.getWatchlist);
router.get('/check/:tmdbId', auth, watchlistController.checkWatchlist);

module.exports = router;