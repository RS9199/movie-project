require('dotenv').config()

const sessionManager = require('../utils/sessionManager');

console.log('TESTING SESSION MANAGER\n');
console.log('='.repeat(50));

function test1() {
    console.log('\nTEST 1: Create New Session');
    console.log('-'.repeat(50));

    const sessionId = 'test-session-001';
    const history = [
        { role: 'user', content: 'I love sci-fi movies' },
        { role: 'assistant', content: 'Here are some recommendations...' }
    ];

    sessionManager.updateSession(sessionId, history);

    const result = sessionManager.getSession(sessionId);

    if (!result) {
        throw new Error('Session not found after creating it');
    }

    if (result.length !== 2) {
        throw new Error('History length is wrong. Expected 2, got ' + result.length);
    }

    if (result[0].role !== 'user') {
        throw new Error('First message role is wrong');
    }

    if (result[0].content !== 'I love sci-fi movies') {
        throw new Error('First message content is wrong');
    }

    console.log('Session created successfully');
    console.log('History length: ' + result.length + ' - OK');
    console.log('First message role: ' + result[0].role + ' - OK');
    console.log('First message content: ' + result[0].content + ' - OK');
    console.log('TEST 1 PASSED');
}

function test2() {
    console.log('\nTEST 2: Update Existing Session');
    console.log('-'.repeat(50));

    const sessionId = 'test-session-002';

    const history1 = [
        { role: 'user', content: 'I love sci-fi' },
        { role: 'assistant', content: 'Try Interstellar!' }
    ];

    sessionManager.updateSession(sessionId, history1);
    console.log('First update done - history length: ' + history1.length);

    const history2 = [
        { role: 'user', content: 'I love sci-fi' },
        { role: 'assistant', content: 'Try Interstellar!' },
        { role: 'user', content: 'Something newer?' },
        { role: 'assistant', content: 'Try Dune!' }
    ];

    sessionManager.updateSession(sessionId, history2);
    console.log('Second update done - history length: ' + history2.length);

    const result = sessionManager.getSession(sessionId);

    if (!result) {
        throw new Error('Session not found');
    }

    if (result.length !== 4) {
        throw new Error('History length wrong. Expected 4, got ' + result.length);
    }

    console.log('Updated history length: ' + result.length + ' - OK');
    console.log('Last message: ' + result[3].content + ' - OK');
    console.log('TEST 2 PASSED');
}

function test3() {
    console.log('\nTEST 3: Get Non-Existent Session');
    console.log('-'.repeat(50));

    const result = sessionManager.getSession('non-existent-session-id');

    if (result !== null) {
        throw new Error('Expected null for non-existent session, got: ' + result);
    }

    console.log('Non-existent session returns null - OK');
    console.log('TEST 3 PASSED');
}

function test4() {
    console.log('\nTEST 4: Clear Session');
    console.log('-'.repeat(50));

    const sessionId = 'test-session-003';
    const history = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
    ];

    sessionManager.updateSession(sessionId, history);
    console.log('Session created');

    const beforeClear = sessionManager.getSession(sessionId);
    if (!beforeClear) {
        throw new Error('Session should exist before clearing');
    }
    console.log('Session exists before clear - OK');

    sessionManager.clearSession(sessionId);
    console.log('Session cleared');

    const afterClear = sessionManager.getSession(sessionId);
    if (afterClear !== null) {
        throw new Error('Session should not exist after clearing');
    }
    console.log('Session does not exist after clear - OK');
    console.log('TEST 4 PASSED');
}

function test5() {
    console.log('\nTEST 5: Session Count');
    console.log('-'.repeat(50));

    const initialCount = sessionManager.getSessionCount();
    console.log('Initial session count: ' + initialCount);

    sessionManager.updateSession('count-test-001', []);
    sessionManager.updateSession('count-test-002', []);
    sessionManager.updateSession('count-test-003', []);

    const newCount = sessionManager.getSessionCount();
    console.log('Count after adding 3 sessions: ' + newCount);

    if (newCount !== initialCount + 3) {
        throw new Error('Session count wrong. Expected ' + (initialCount + 3) + ', got ' + newCount);
    }

    sessionManager.clearSession('count-test-001');
    sessionManager.clearSession('count-test-002');
    sessionManager.clearSession('count-test-003');

    const finalCount = sessionManager.getSessionCount();
    console.log('Count after clearing 3 sessions: ' + finalCount);

    if (finalCount !== initialCount) {
        throw new Error('Session count wrong after clearing');
    }

    console.log('Session count is correct - OK');
    console.log('TEST 5 PASSED');
}

function test6() {
    console.log('\nTEST 6: Multiple Sessions Independent');
    console.log('-'.repeat(50));

    const session1Id = 'independent-001';
    const session2Id = 'independent-002';

    const history1 = [
        { role: 'user', content: 'I love sci-fi' }
    ];

    const history2 = [
        { role: 'user', content: 'I love romance' }
    ];

    sessionManager.updateSession(session1Id, history1);
    sessionManager.updateSession(session2Id, history2);

    const result1 = sessionManager.getSession(session1Id);
    const result2 = sessionManager.getSession(session2Id);

    if (result1[0].content !== 'I love sci-fi') {
        throw new Error('Session 1 content is wrong');
    }

    if (result2[0].content !== 'I love romance') {
        throw new Error('Session 2 content is wrong');
    }

    console.log('Session 1 content: ' + result1[0].content + ' - OK');
    console.log('Session 2 content: ' + result2[0].content + ' - OK');
    console.log('Sessions are independent from each other - OK');
    console.log('TEST 6 PASSED');
}

function runAllTests() {
    try {
        console.log('\nStarting all tests...\n');

        test1();
        test2();
        test3();
        test4();
        test5();
        test6();

        console.log('\n' + '='.repeat(50));
        console.log('ALL TESTS PASSED');
        console.log('='.repeat(50));
        console.log('\nsessionManager.js is working correctly!');

    } catch (error) {
        console.log('\n' + '='.repeat(50));
        console.log('TESTS FAILED');
        console.log('='.repeat(50));
        console.log('\nError: ' + error.message + '\n');
        process.exit(1);
    }
}

runAllTests();