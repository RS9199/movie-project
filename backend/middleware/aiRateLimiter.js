const requestCounts = new Map();

const WINDOW_MS = 24 * 60 * 60 * 1000;  // 24 hours
const MAX_REQUESTS = 50;                  // 50 recommendations per day

function aiRateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record) {
        requestCounts.set(ip, { count: 1, startTime: now });
        return next();
    }

    const elapsed = now - record.startTime;

    if (elapsed > WINDOW_MS) {
        record.count = 1;
        record.startTime = now;
        return next();
    }

    record.count++;

    if (record.count > MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Daily recommendation limit reached (50/day). Please try again tomorrow.',
            retryAfter: Math.ceil((WINDOW_MS - elapsed) / 1000)
        });
    }

    next();
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now - record.startTime > WINDOW_MS) {
            requestCounts.delete(ip);
        }
    }
}, 60 * 60 * 1000);

module.exports = aiRateLimiter;