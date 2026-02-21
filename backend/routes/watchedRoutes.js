const express = require('express');
const router = express.Router();
const watchedController = require('../controllers/watchedController');
const auth = require('../middleware/auth');

router.post('/', auth, watchedController.addToWatched);
router.delete('/:tmdbId', auth, watchedController.removeFromWatched);
router.get('/', auth, watchedController.getWatched);
router.get('/stats', auth, watchedController.getStats);

module.exports = router;