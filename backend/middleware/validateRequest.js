/**
 * Validate Request Middleware
 *
 * PURPOSE: Checks that incoming requests contain valid data BEFORE
 * they reach the controller. This prevents bad data from wasting
 * resources (like making an expensive Gemini API call with empty input).
 *
 * WHAT IT CHECKS:
 * 1. Does the request have a body? (req.body exists)
 * 2. Does the body contain a "message" field?
 * 3. Is the message a string?
 * 4. Is the message non-empty after trimming whitespace?
 * 5. Is the message within a reasonable length? (not too long)
 *
 * WHY EACH CHECK MATTERS:
 * - No body         → Client forgot to send JSON, or Content-Type header is wrong
 * - No message      → Client sent JSON but with wrong field names
 * - Not a string    → Client sent a number, array, or object instead of text
 * - Empty string    → Client sent "" or "   " (just spaces)
 * - Too long        → Prevents abuse (someone sending a 10MB message to Gemini)
 */

const MAX_MESSAGE_LENGTH = 1000; // Characters — generous but prevents abuse

/**
 * Validates the /recommend endpoint requests
 *
 * Expects request body like:
 * {
 *   "message": "I like sci-fi movies with plot twists",
 *   "sessionId": "abc123"    ← optional
 * }
 *
 * @param {Object} req   - Express request object
 * @param {Object} res   - Express response object
 * @param {Function} next - Passes to next middleware/controller if valid
 */
function validateRecommendRequest(req, res, next) {
    // CHECK 1: Does the request body exist?
    // This can be missing if:
    //   - Client didn't send a body at all
    //   - Client forgot Content-Type: application/json header
    //   - Express body parser (express.json()) wasn't set up
    if (!req.body) {
        return res.status(400).json({
            error: 'Request body is missing. Send JSON with Content-Type: application/json'
        });
    }

    const { message, sessionId } = req.body;

    // CHECK 2: Is the "message" field present?
    // undefined = field not included at all
    // null = field included but set to null
    if (message === undefined || message === null) {
        return res.status(400).json({
            error: 'Missing required field: "message". Tell us what kind of movies you like!'
        });
    }

    // CHECK 3: Is message a string?
    // Someone might send: { "message": 123 } or { "message": ["action", "comedy"] }
    if (typeof message !== 'string') {
        return res.status(400).json({
            error: '"message" must be a string'
        });
    }

    // CHECK 4: Is the message non-empty after trimming whitespace?
    // "   "  → trims to "" → empty
    // "\n\t" → trims to "" → empty
    const trimmed = message.trim();

    if (trimmed.length === 0) {
        return res.status(400).json({
            error: '"message" cannot be empty'
        });
    }

    // CHECK 5: Is the message within length limits?
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            error: `"message" is too long. Maximum ${MAX_MESSAGE_LENGTH} characters, got ${trimmed.length}`
        });
    }

    // OPTIONAL: Validate sessionId if provided
    // sessionId is optional — new users won't have one yet
    // But IF they send one, it should at least be a non-empty string
    if (sessionId !== undefined && sessionId !== null) {
        if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
            return res.status(400).json({
                error: '"sessionId" must be a non-empty string if provided'
            });
        }
    }

    // ✅ ALL CHECKS PASSED
    // Attach the cleaned (trimmed) message to req for the controller to use
    // This way the controller doesn't need to trim again
    req.cleanMessage = trimmed;

    // Pass control to the next middleware or route handler
    next();
}

// --- Exports ---
module.exports = validateRecommendRequest;
module.exports.MAX_MESSAGE_LENGTH = MAX_MESSAGE_LENGTH;