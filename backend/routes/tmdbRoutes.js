const express = require('express');
const router = express.Router();
const tmdbController = require('../controllers/tmdbController');

router.get('/trending', tmdbController.getTrending);

module.exports = router;