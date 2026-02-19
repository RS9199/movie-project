const express = require('express');
const request = require('supertest');
const movieRoutes = require('../routes/movieRoutes');

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

const app = express();
app.use(express.json());
app.use('/api', movieRoutes);

// Add error handler for test app
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ error: err.message });
});

async function runTests() {
    // TEST 1
    console.log('\nTest 1: GET /api/health returns 200');
    {
        const res = await request(app).get('/api/health');

        assert(res.status === 200, 'Status code is 200');
        assert(res.body.status === 'ok', 'Body contains status ok');
        assert(typeof res.body.timestamp === 'string', 'Body contains timestamp');
        assert(typeof res.body.activeSessions === 'number', 'Body contains activeSessions');
    }

    // TEST 2
    console.log('\nTest 2: POST /api/recommend without body returns 400');
    {
        const res = await request(app)
            .post('/api/recommend')
            .send();

        assert(res.status === 400, 'Status code is 400');
        assert(res.body.error !== undefined, 'Error message exists');
    }

    // TEST 3
    console.log('\nTest 3: POST /api/recommend with empty message returns 400');
    {
        const res = await request(app)
            .post('/api/recommend')
            .send({ message: '' });

        assert(res.status === 400, 'Status code is 400');
        assert(res.body.error !== undefined, 'Error message exists');
    }

    // TEST 4
    console.log('\nTest 4: POST /api/recommend with valid message reaches controller');
    {
        const res = await request(app)
            .post('/api/recommend')
            .send({ message: 'I like action movies' });

        assert(res.status === 500, 'Status code is 500 (Gemini API not available in tests)');
    }

    // TEST 5
    console.log('\nTest 5: POST /api/clear without sessionId returns 400');
    {
        const res = await request(app)
            .post('/api/clear')
            .send({});

        assert(res.status === 400, 'Status code is 400');
        assert(res.body.error.includes('sessionId'), 'Error mentions sessionId');
    }

    // TEST 6
    console.log('\nTest 6: POST /api/clear with sessionId returns 200');
    {
        const res = await request(app)
            .post('/api/clear')
            .send({ sessionId: 'test-123' });

        assert(res.status === 200, 'Status code is 200');
        assert(res.body.message.includes('cleared'), 'Response confirms cleared');
    }

    // TEST 7
    console.log('\nTest 7: POST /api/recommend with non-string message returns 400');
    {
        const res = await request(app)
            .post('/api/recommend')
            .send({ message: 12345 });

        assert(res.status === 400, 'Status code is 400');
    }

    // RESULTS
    console.log('\n' + '='.repeat(50));
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' tests');
    console.log('='.repeat(50));

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.log('Test suite error: ' + err.message);
    process.exit(1);
});