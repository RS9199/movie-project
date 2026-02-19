const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const movieRoutes = require('./routes/movieRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', movieRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('Health check: http://localhost:' + PORT + '/api/health');
});

module.exports = app;