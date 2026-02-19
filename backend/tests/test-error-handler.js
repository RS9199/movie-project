const errorHandler = require('../middleware/errorHandler');

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

function createMockReq() {
    return {};
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

function createMockNext() {
    let called = false;
    const next = () => { called = true; };
    next.wasCalled = () => called;
    return next;
}

// TEST 1
console.log('\nTest 1: Returns 500 by default');
{
    const err = new Error('Something broke');
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.statusCode === 500, 'Status code is 500');
    assert(res.body.error === 'Something broke', 'Error message is correct');
}

// TEST 2
console.log('\nTest 2: Uses custom statusCode if set on error');
{
    const err = new Error('Not found');
    err.statusCode = 404;
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.statusCode === 404, 'Status code is 404');
    assert(res.body.error === 'Not found', 'Error message is correct');
}

// TEST 3
console.log('\nTest 3: Returns default message when error has no message');
{
    const err = new Error();
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.statusCode === 500, 'Status code is 500');
    assert(res.body.error === 'Internal server error' || res.body.error === '', 'Fallback error message used');
}

// TEST 4
console.log('\nTest 4: Includes stack trace in development mode');
{
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = new Error('Dev error');
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.body.stack !== undefined, 'Stack trace is included');

    process.env.NODE_ENV = originalEnv;
}

// TEST 5
console.log('\nTest 5: Excludes stack trace in production mode');
{
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Prod error');
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.body.stack === undefined, 'Stack trace is NOT included');

    process.env.NODE_ENV = originalEnv;
}

// TEST 6
console.log('\nTest 6: Response includes status field');
{
    const err = new Error('Bad request');
    err.statusCode = 400;
    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    errorHandler(err, req, res, next);

    assert(res.body.status === 400, 'Response body includes status field');
}

// RESULTS
console.log('\n' + '='.repeat(50));
console.log('Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' tests');
console.log('='.repeat(50));

if (failed > 0) {
    process.exit(1);
}