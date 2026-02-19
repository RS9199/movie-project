const express = require('express');
const router = express.Router();

const movieController = require('../controllers/movieController');
const validateRequest = require('../middleware/validateRequest');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/recommend', rateLimiter, validateRequest, movieController.getRecommendations);

router.post('/clear', movieController.clearHistory);

router.get('/health', movieController.healthCheck);

module.exports = router;