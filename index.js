const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors middleware
const loginRoutes = require('./userRoutes/login'); // Import login routes
const queryRoutes = require('./userRoutes/queryRoutes'); // Import query routes
const otherRoutes = require('./userRoutes/routes'); // Import other routes (e.g., CRUD for Agent, Admin, Manager)
const builtTime = require('./built-time');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' })); // Enable CORS for all origins using "*"
app.use(bodyParser.json());

// Use Routes
app.use('/api', loginRoutes); // Set the login routes under /api
app.use('/api', queryRoutes); // Set the query routes under /api
app.use('/api', otherRoutes); // Set the other routes (CRUD operations) under /api

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
