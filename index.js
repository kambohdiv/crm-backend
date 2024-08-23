// const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loginRoutes = require('../userRoutes/login');
const queryRoutes = require('../userRoutes/queryRoutes');
const otherRoutes = require('../userRoutes/routes');
const builtTime = require('../built-time');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Use Routes
app.use('/api', loginRoutes);
app.use('/api', queryRoutes);
app.use('/api', otherRoutes);

// Export the Express app
module.exports = app;