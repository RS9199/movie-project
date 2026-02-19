require('dotenv').config();

const geminiService = require('../services/geminiService');

console.log('TESTING GEMINI SERVICE\n');
console.log('='.repeat(50));

async function test1() {
    console.log('\nTEST 1: First Request (Empty History)');
    console.log('-'.repeat(50));

    try {
        const startTime = Date.now();

        const result = await geminiService.getMovieRecommendations(
            'I love sci-fi movies with complex plots',
            []
        );

        const endTime = Date.now();

        console.log('Success!');
        console.log('Time taken: ' + (endTime - startTime) + 'ms');
        console.log('Got ' + result.recommendations.length + ' recommendations');
        console.log('Conversation history has ' + result.conversationHistory.length + ' messages');

        if (result.recommendations.length > 0) {
            console.log('\nFirst Recommendation:');
            const movie = result.recommendations[0];
            console.log('   Title: ' + movie.title);
            console.log('   Year: ' + movie.year);
            console.log('   Genre: ' + movie.genre);
            console.log('   Rating: ' + movie.rating);
            console.log('   Director: ' + movie.director);
            console.log('   Why: ' + movie.why);
        }

        console.log('\nConversation History:');
        result.conversationHistory.forEach((msg, idx) => {
            console.log('   ' + (idx + 1) + '. ' + msg.role + ': ' + msg.content.substring(0, 50) + '...');
        });

        return result;

    } catch (error) {
        console.error('Test 1 Failed:', error.message);
        throw error;
    }
}

async function test2(previousResult) {
    console.log('\nTEST 2: Follow-up Request (With History)');
    console.log('-'.repeat(50));

    try {
        const startTime = Date.now();

        const result = await geminiService.getMovieRecommendations(
            'Something more recent, from the last 5 years',
            previousResult.conversationHistory
        );

        const endTime = Date.now();

        console.log('Success!');
        console.log('Time taken: ' + (endTime - startTime) + 'ms');
        console.log('Got ' + result.recommendations.length + ' recommendations');
        console.log('Conversation history has ' + result.conversationHistory.length + ' messages');

        if (result.recommendations.length > 0) {
            console.log('\nFirst Recommendation:');
            const movie = result.recommendations[0];
            console.log('   Title: ' + movie.title);
            console.log('   Year: ' + movie.year);
        }

        console.log('\nFull Conversation History:');
        result.conversationHistory.forEach((msg, idx) => {
            console.log('   ' + (idx + 1) + '. ' + msg.role + ': ' + msg.content.substring(0, 50) + '...');
        });

        return result;

    } catch (error) {
        console.error('Test 2 Failed:', error.message);
        throw error;
    }
}

async function test3() {
    console.log('\nTEST 3: Verify Data Structure');
    console.log('-'.repeat(50));

    try {
        const result = await geminiService.getMovieRecommendations(
            'Recommend action movies',
            []
        );

        // Check recommendations structure
        console.log('Checking recommendations structure...');

        if (!Array.isArray(result.recommendations)) {
            throw new Error('recommendations is not an array');
        }
        console.log('recommendations is an array - OK');

        if (result.recommendations.length > 0) {
            const movie = result.recommendations[0];
            const requiredFields = ['title', 'year', 'genre', 'rating', 'runtime', 'director', 'plot', 'why'];

            requiredFields.forEach(field => {
                if (!(field in movie)) {
                    throw new Error('Missing field: ' + field);
                }
                console.log('Has field: ' + field + ' - OK');
            });
        }

        // Check conversation history structure
        console.log('\nChecking conversation history structure...');

        if (!Array.isArray(result.conversationHistory)) {
            throw new Error('conversationHistory is not an array');
        }
        console.log('conversationHistory is an array - OK');

        result.conversationHistory.forEach((msg, idx) => {
            if (!msg.role) {
                throw new Error('Message ' + idx + ' missing role');
            }
            if (!msg.content) {
                throw new Error('Message ' + idx + ' missing content');
            }
        });
        console.log('All messages have role and content - OK');

        console.log('\nAll structure checks passed!');

    } catch (error) {
        console.error('Test 3 Failed:', error.message);
        throw error;
    }
}

async function runAllTests() {
    try {
        console.log('\nStarting all tests...\n');

        const result1 = await test1();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const result2 = await test2(result1);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await test3();

        console.log('\n' + '='.repeat(50));
        console.log('ALL TESTS PASSED');
        console.log('='.repeat(50));
        console.log('\ngeminiService.js is working correctly!');
        console.log('Ready to move to next file!\n');

    } catch (error) {
        console.log('\n' + '='.repeat(50));
        console.log('TESTS FAILED');
        console.log('='.repeat(50));
        console.log('\nPlease fix the errors above before continuing.\n');
        process.exit(1);
    }
}

runAllTests();