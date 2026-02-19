/**
 * Rate Limiter Middleware
 *
 * PURPOSE: Prevents abuse by limiting how many requests a single IP address
 * can make within a time window.
 *
 * HOW IT WORKS:
 * 1. Each incoming request's IP address is recorded
 * 2. We count how many requests that IP made in the current time window
 * 3. If they exceeded the limit → block with 429 status ("Too Many Requests")
 * 4. If they're under the limit → let the request through
 * 5. Old entries are cleaned up automatically to prevent memory leaks
 */

// Store request counts per IP address
const requestCounts = new Map();

// --- Configuration ---
const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes in milliseconds
const MAX_REQUESTS = 100;            // Max requests allowed per window per IP

function rateLimiter(req, res, next) {

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    // Step 2: First time seeing this IP? Create a fresh record
    if (!record) {
        requestCounts.set(ip, {
            count: 1,          // This is their 1st request
            startTime: now     // Window starts now
        });
        return next(); // Let them through
    }

    // Step 3: Check if this IP's time window has expired
    const elapsed = now - record.startTime;

    if (elapsed > WINDOW_MS) {
        // Window expired → reset everything, treat as fresh start
        record.count = 1;
        record.startTime = now;
        return next();
    }

    // Step 4: Still within the window → increment counter
    record.count++;

    if (record.count > MAX_REQUESTS) {
        // BLOCKED! They've exceeded the limit
        // HTTP 429 = "Too Many Requests" (standard status code)
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((WINDOW_MS - elapsed) / 1000) // seconds until window resets
        });
    }

    // Step 5: Under the limit → let the request continue
    next();
}


function cleanupExpiredRecords() {
    const now = Date.now();
    let cleaned = 0;

    for (const [ip, record] of requestCounts.entries()) {
        if (now - record.startTime > WINDOW_MS) {
            requestCounts.delete(ip);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`Rate limiter cleanup: removed ${cleaned} expired records`);
    }
}

// Run cleanup every 10 minutes automatically
setInterval(cleanupExpiredRecords, 10 * 60 * 1000);


module.exports = rateLimiter;

// Additional exports for testing purposes
// (In production code, you'd only use the middleware. But tests need
//  to inspect and reset internal state.)
module.exports.getRequestCounts = () => requestCounts;
module.exports.resetAllLimits = () => requestCounts.clear();
module.exports.WINDOW_MS = WINDOW_MS;
module.exports.MAX_REQUESTS = MAX_REQUESTS;
