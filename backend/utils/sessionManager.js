const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000;

exports.getSession = (sessionId) => {
    const session = sessions.get(sessionId);

    if (session && Date.now() - session.lastAccess < SESSION_TIMEOUT) {
        session.lastAccess = Date.now();
        return session.history;
    }

    return null;
};

exports.updateSession = (sessionId, history) => {
    sessions.set(sessionId, {
        history,
        lastAccess: Date.now()
    });
};

exports.clearSession = (sessionId) => {
    sessions.delete(sessionId);
};

exports.getSessionCount = () => {
    return sessions.size;
};

function cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
        if (now - session.lastAccess > SESSION_TIMEOUT) {
            sessions.delete(sessionId);
            console.log('Deleted expired session:', sessionId);
        }
    }
}

setInterval(cleanupExpiredSessions, 10 * 60 * 1000);
