const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const tmdbRoutes = require('./routes/tmdbRoutes');

dotenv.config();

const connectDB = require('./config/database');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const passport = require('./config/passport');
const watchlistRoutes = require('./routes/watchlistRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('Server running on port ' + PORT);
            console.log('Health check: http://localhost:' + PORT + '/api/health');
        });
    } catch (error) {
        console.error('Failed to start server: ' + error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;