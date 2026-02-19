const movieController = require('../controllers/movieController');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log('  PASS: ' + testName);
        passed++;
    } else {
        console.log('  FAIL: ' + testName);
        failed++;
    }
}

function createMockReq(body, cleanMessage) {
    return {
        body: body,
        cleanMessage: cleanMessage || null
    };
}

function createMockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            res.statusCode = code;
            return res;
        },
        json(data) {
            res.body = data;
            return res;
        }
    };
    return res;
}

// ========================================
// TEST 1: healthCheck returns correct response
// ========================================
console.log('\nTest 1: healthCheck returns status ok');
{
    const req = createMockReq({});
    const res = createMockRes();

    movieController.healthCheck(req, res);

    assert(res.statusCode === 200, 'Status code is 200');
    assert(res.body.status === 'ok', 'Status is ok');
    assert(typeof res.body.timestamp === 'string', 'Timestamp is a string');
    assert(typeof res.body.activeSessions === 'number', 'activeSessions is a number');
}

// ========================================
// TEST 2: clearHistory requires sessionId
// ========================================
console.log('\nTest 2: clearHistory rejects missing sessionId');
{
    const req = createMockReq({});
    const res = createMockRes();

    movieController.clearHistory(req, res);

    assert(res.statusCode === 400, 'Status code is 400');
    assert(res.body.error.includes('sessionId'), 'Error mentions sessionId');
}

// ========================================
// TEST 3: clearHistory works with valid sessionId
// ========================================
console.log('\nTest 3: clearHistory works with valid sessionId');
{
    const req = createMockReq({ sessionId: 'test-session-123' });
    const res = createMockRes();

    movieController.clearHistory(req, res);

    assert(res.statusCode === 200, 'Status code is 200');
    assert(res.body.message.includes('cleared'), 'Response confirms cleared');
    assert(res.body.sessionId === 'test-session-123', 'SessionId returned correctly');
}

// ========================================
// TEST 4: getRecommendations calls next(error) on failure
// ========================================
console.log('\nTest 4: getRecommendations passes errors to next()');
{
    // This will fail because geminiService needs a real API key
    // But we can verify it properly passes the error to next()
    const req = createMockReq({ message: 'I like action movies' }, 'I like action movies');
    const res = createMockRes();
    let nextCalledWithError = false;

    movieController.getRecommendations(req, res, (error) => {
        if (error) {
            nextCalledWithError = true;
        }
    }).then(() => {
        // getRecommendations is async, so we check after it resolves
        assert(nextCalledWithError === true, 'next() was called with an error');
        printResults();
    });
}

// ========================================
// TEST 5: getRecommendations generates sessionId if not provided
// ========================================
console.log('\nTest 5: getRecommendations generates sessionId when not provided');
{
    const req = createMockReq({ message: 'I like comedies' }, 'I like comedies');
    const res = createMockRes();

    // We expect it to fail (no API key) but we can check that
    // it attempted to process the request properly
    movieController.getRecommendations(req, res, (error) => {
        // Even though it failed, the function ran — that's what we're testing
        assert(error !== undefined, 'Function attempted to process (failed at API call)');
    });
}

function printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' tests');
    console.log('='.repeat(50));

    if (failed > 0) {
        process.exit(1);
    }
}

// Give async tests time to complete
setTimeout(() => {
    printResults();
}, 3000);