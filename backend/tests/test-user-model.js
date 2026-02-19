const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

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

async function runTests() {
    // Connect to test database (separate from main database)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing\n');

    // Clean up any leftover test data
    await User.deleteMany({ email: /test@/ });

    // TEST 1
    console.log('Test 1: Create user with valid data');
    {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        assert(user.name === 'Test User', 'Name is correct');
        assert(user.email === 'test@example.com', 'Email is correct');
        assert(user.password !== 'password123', 'Password was hashed');
        assert(user.role === 'user', 'Default role is user');
        assert(user.isVerified === false, 'Default isVerified is false');
        assert(user.watchlist.length === 0, 'Watchlist starts empty');
        assert(user.watchedMovies.length === 0, 'WatchedMovies starts empty');
        assert(user.createdAt !== undefined, 'createdAt timestamp exists');
    }

    // TEST 2
    console.log('\nTest 2: Password is hashed with bcrypt');
    {
        const user = await User.findOne({ email: 'test@example.com' }).select('+password');

        assert(user.password.startsWith('$2'), 'Password starts with bcrypt prefix');
        assert(user.password.length > 50, 'Hashed password is long');
    }

    // TEST 3
    console.log('\nTest 3: comparePassword works correctly');
    {
        const user = await User.findOne({ email: 'test@example.com' }).select('+password');

        const correctMatch = await user.comparePassword('password123');
        assert(correctMatch === true, 'Correct password returns true');

        const wrongMatch = await user.comparePassword('wrongpassword');
        assert(wrongMatch === false, 'Wrong password returns false');
    }

    // TEST 4
    console.log('\nTest 4: Password is hidden by default (select: false)');
    {
        const user = await User.findOne({ email: 'test@example.com' });

        assert(user.password === undefined, 'Password is not returned by default');
    }

    // TEST 5
    console.log('\nTest 5: Duplicate email is rejected');
    {
        try {
            await User.create({
                name: 'Another User',
                email: 'test@example.com',
                password: 'password456'
            });
            assert(false, 'Should have thrown duplicate error');
        } catch (error) {
            assert(error.code === 11000, 'Duplicate key error thrown');
        }
    }

    // TEST 6
    console.log('\nTest 6: Invalid email is rejected');
    {
        try {
            await User.create({
                name: 'Bad Email User',
                email: 'notanemail',
                password: 'password123'
            });
            assert(false, 'Should have thrown validation error');
        } catch (error) {
            assert(error.name === 'ValidationError', 'Validation error thrown');
        }
    }

    // TEST 7
    console.log('\nTest 7: Missing name is rejected');
    {
        try {
            await User.create({
                email: 'test2@example.com',
                password: 'password123'
            });
            assert(false, 'Should have thrown validation error');
        } catch (error) {
            assert(error.name === 'ValidationError', 'Validation error thrown');
        }
    }

    // TEST 8
    console.log('\nTest 8: Short password is rejected');
    {
        try {
            await User.create({
                name: 'Short Pass User',
                email: 'test3@example.com',
                password: '123'
            });
            assert(false, 'Should have thrown validation error');
        } catch (error) {
            assert(error.name === 'ValidationError', 'Validation error thrown');
        }
    }

    // TEST 9
    console.log('\nTest 9: Email is saved as lowercase');
    {
        const user = await User.create({
            name: 'Uppercase Email',
            email: 'TEST4@EXAMPLE.COM',
            password: 'password123'
        });

        assert(user.email === 'test4@example.com', 'Email converted to lowercase');
    }

    // TEST 10
    console.log('\nTest 10: Name is trimmed');
    {
        const user = await User.create({
            name: '   Spaces User   ',
            email: 'test5@example.com',
            password: 'password123'
        });

        assert(user.name === 'Spaces User', 'Name was trimmed');
    }

    // TEST 11
    console.log('\nTest 11: Invalid role is rejected');
    {
        try {
            await User.create({
                name: 'Bad Role User',
                email: 'test6@example.com',
                password: 'password123',
                role: 'superadmin'
            });
            assert(false, 'Should have thrown validation error');
        } catch (error) {
            assert(error.name === 'ValidationError', 'Validation error thrown');
        }
    }

    // Cleanup test data
    await User.deleteMany({ email: /test/ });
    console.log('\nCleaned up test data');

    // RESULTS
    console.log('\n' + '='.repeat(50));
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed out of ' + (passed + failed) + ' tests');
    console.log('='.repeat(50));

    await mongoose.connection.close();

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.log('Test suite error: ' + err.message);
    mongoose.connection.close();
    process.exit(1);
});