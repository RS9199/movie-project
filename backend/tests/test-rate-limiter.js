/**
 * Test file for rateLimiter middleware
 *
 * Run with: node tests/test-rate-limiter.js
 *
 * WHAT WE'RE TESTING:
 * 1. First request from a new IP is allowed
 * 2. Requests under the limit are allowed
 * 3. Requests OVER the limit are blocked with 429
 * 4. The 429 response includes the correct error message and retryAfter
 * 5. After the window expires, the counter resets
 * 6. Different IPs have independent limits
 */

const rateLimiter = require('../middleware/rateLimiter');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${testName}`);
        failed++;
    }
}

/**
 * MOCK OBJECTS
 *
 * In testing, we don't want to spin up a real Express server.
 * Instead, we create "mock" (fake) objects that behave like req, res, and next.
 *
 * mockReq: Simulates an incoming request — we just need the IP
 * mockRes: Simulates the response — captures status code and JSON body
 * mockNext: A simple function that records whether it was called
 */

function createMockReq(ip) {
    return {
        ip: ip,
        connection: { remoteAddress: ip }
    };
}

function createMockRes() {
    const res = {
        statusCode: null,      // Will store the status code passed to .status()
        body: null,            // Will store the JSON body passed to .json()
        status(code) {         // Mock .status() — Express chains this: res.status(429).json({})
            res.statusCode = code;
            return res;        // Return res to allow chaining (.status().json())
        },
        json(data) {           // Mock .json() — captures what would be sent to the client
            res.body = data;
            return res;
        }
    };
    return res;
}

// --- TESTS ---

// Clean slate before all tests
rateLimiter.resetAllLimits();

// ========================================
// TEST 1: First request should be allowed
// ========================================
console.log('\n🧪 Test 1: First request from new IP is allowed');
{
    rateLimiter.resetAllLimits();

    const req = createMockReq('192.168.1.1');
    const res = createMockRes();
    let nextCalled = false;

    // When next() is called, it means the middleware allowed the request through
    rateLimiter(req, res, () => { nextCalled = true; });

    assert(nextCalled === true, 'next() was called (request allowed)');
    assert(res.statusCode === null, 'No status code set (not blocked)');
}

// ========================================
// TEST 2: Multiple requests under limit
// ========================================
console.log('\n🧪 Test 2: Multiple requests under the limit are all allowed');
{
    rateLimiter.resetAllLimits();

    let allAllowed = true;

    // Send 50 requests (well under the 100 limit)
    for (let i = 0; i < 50; i++) {
        const req = createMockReq('10.0.0.1');
        const res = createMockRes();
        let nextCalled = false;

        rateLimiter(req, res, () => { nextCalled = true; });

        if (!nextCalled) {
            allAllowed = false;
            break;
        }
    }

    assert(allAllowed === true, 'All 50 requests were allowed through');
}

// ========================================
// TEST 3: Request over limit is blocked
// ========================================
console.log('\n🧪 Test 3: Request #101 is blocked with 429');
{
    rateLimiter.resetAllLimits();

    // Send exactly 100 requests (the limit)
    for (let i = 0; i < 100; i++) {
        const req = createMockReq('10.0.0.2');
        const res = createMockRes();
        rateLimiter(req, res, () => {});
    }

    // Request #101 should be blocked
    const req = createMockReq('10.0.0.2');
    const res = createMockRes();
    let nextCalled = false;

    rateLimiter(req, res, () => { nextCalled = true; });

    assert(nextCalled === false, 'next() was NOT called (request blocked)');
    assert(res.statusCode === 429, 'Status code is 429');
    assert(res.body.error === 'Too many requests. Please try again later.', 'Error message is correct');
    assert(typeof res.body.retryAfter === 'number', 'retryAfter is a number');
    assert(res.body.retryAfter > 0, 'retryAfter is positive');
}

// ========================================
// TEST 4: Different IPs are independent
// ========================================
console.log('\n🧪 Test 4: Different IPs have separate counters');
{
    rateLimiter.resetAllLimits();

    // Exhaust limit for IP-A
    for (let i = 0; i < 101; i++) {
        const req = createMockReq('1.1.1.1');
        const res = createMockRes();
        rateLimiter(req, res, () => {});
    }

    // IP-B should still be allowed (different IP, fresh counter)
    const req = createMockReq('2.2.2.2');
    const res = createMockRes();
    let nextCalled = false;

    rateLimiter(req, res, () => { nextCalled = true; });

    assert(nextCalled === true, 'Different IP is not affected by first IP\'s limit');
}

// ========================================
// TEST 5: Window expiry resets the counter
// ========================================
console.log('\n🧪 Test 5: Counter resets after window expires');
{
    rateLimiter.resetAllLimits();

    // Manually insert an expired record
    // This simulates an IP that made 200 requests, but their window started
    // 16 minutes ago (which is past the 15-minute window)
    const counts = rateLimiter.getRequestCounts();
    counts.set('expired-ip', {
        count: 200,
        startTime: Date.now() - rateLimiter.WINDOW_MS - 1000  // 1 second past expiry
    });

    // Next request from this IP should be allowed (window expired → reset)
    const req = createMockReq('expired-ip');
    const res = createMockRes();
    let nextCalled = false;

    rateLimiter(req, res, () => { nextCalled = true; });

    assert(nextCalled === true, 'Request allowed after window expired');

    // Verify count was reset to 1
    const record = counts.get('expired-ip');
    assert(record.count === 1, 'Counter was reset to 1');
}

// ========================================
// TEST 6: resetAllLimits clears everything
// ========================================
console.log('\n🧪 Test 6: resetAllLimits() clears all records');
{
    // Add some records
    for (let i = 0; i < 10; i++) {
        const req = createMockReq(`ip-${i}`);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
    }

    assert(rateLimiter.getRequestCounts().size > 0, 'Records exist before reset');

    rateLimiter.resetAllLimits();

    assert(rateLimiter.getRequestCounts().size === 0, 'All records cleared after reset');
}

// ========================================
// RESULTS
// ========================================
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log('='.repeat(50));

if (failed > 0) {
    process.exit(1);
}
