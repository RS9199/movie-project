const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/geminiService');
const sessionManager = require('../utils/sessionManager');

exports.getRecommendations = async (req, res, next) => {
    try {
        const message = req.cleanMessage || req.body.message;
        const sessionId = req.body.sessionId || uuidv4();

        const history = sessionManager.getSession(sessionId) || [];

        const result = await geminiService.getMovieRecommendations(message, history);

        sessionManager.updateSession(sessionId, result.conversationHistory);

        res.status(200).json({
            sessionId: sessionId,
            recommendations: result.recommendations,
            message: 'Here are your movie recommendations'
        });

    } catch (error) {
        next(error);
    }
};

exports.clearHistory = (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({
            error: 'sessionId is required to clear history'
        });
    }

    sessionManager.clearSession(sessionId);

    res.status(200).json({
        message: 'Conversation history cleared',
        sessionId: sessionId
    });
};

exports.healthCheck = (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        activeSessions: sessionManager.getSessionCount()
    });
};