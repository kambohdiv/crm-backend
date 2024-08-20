// queryRoutes.js

const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// Get Queries by Agent ID
router.get('/queries/agent/:agentId', (req, res) => {
  const { agentId } = req.params;

  connection.query('SELECT * FROM Queries WHERE agentId = ?', [agentId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('No queries found for this agent');
    }
    res.status(200).json(results);
  });
});

module.exports = router;
