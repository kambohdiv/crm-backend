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

// Get a single Query by Query ID
router.get('/queries/:queryId', (req, res) => {
  const { queryId } = req.params;

  connection.query('SELECT * FROM Queries WHERE queryId = ?', [queryId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send('Query not found');
    }
    res.status(200).json(results[0]);
  });
});


// Create a new Query
router.post('/queries', (req, res) => {
  const {
    type = '',        // Optional field with default empty string
    queryData,        // Required field
    destination = '', // Optional field with default empty string
    travelType = '',  // Optional field with default empty string
    queryType,        // Required field
    leadSource,       // Required field
    priority = '',    // Optional field with default empty string
    agentId,          // Required field
    status = '',      // Optional field with default empty string
    TravelTime = null,  // Optional field, default to null
    TravelDate = null   // Optional field, default to null
  } = req.body;

  // Check if required fields are present
  if (!agentId || !leadSource || !queryType || !queryData) {
    return res.status(400).send('Missing required fields: agentId, leadSource, queryType, queryData');
  }

  // If TravelTime or TravelDate is an empty string, set it to null
  const travelTimeValue = TravelTime === '' ? null : TravelTime;
  const travelDateValue = TravelDate === '' ? null : TravelDate;

  // Automatically capture the current date and time for queryDate
  const queryDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS

  connection.query(
    'INSERT INTO Queries (type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate, queryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, travelTimeValue, travelDateValue, queryDate],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Query added successfully');
    }
  );
});


router.put('/queries/:queryId', (req, res) => {
  const { queryId } = req.params;
  const {
    type = '',        // Optional field with default empty string
    queryData,        // Required field
    destination = '', // Optional field with default empty string
    travelType = '',  // Optional field with default empty string
    queryType,        // Required field
    leadSource,       // Required field
    priority = '',    // Optional field with default empty string
    agentId,          // Required field
    status = '',      // Optional field with default empty string
    TravelTime = null,  // Optional field, default to null
    TravelDate = null   // Optional field, default to null
  } = req.body;

  // Check if required fields are present
  if (!agentId || !leadSource || !queryType || !queryData) {
    return res.status(400).send('Missing required fields: agentId, leadSource, queryType, queryData');
  }

  // If TravelTime or TravelDate is an empty string, set it to null
  const travelTimeValue = TravelTime === '' ? null : TravelTime;
  const travelDateValue = TravelDate === '' ? null : TravelDate;

  connection.query(
    'UPDATE Queries SET type = ?, queryData = ?, destination = ?, travelType = ?, queryType = ?, leadSource = ?, priority = ?, agentId = ?, status = ?, TravelTime = ?, TravelDate = ? WHERE queryId = ?',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, travelTimeValue, travelDateValue, queryId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Query not found');
      }
      res.status(200).send('Query updated successfully');
    }
  );
});

// Delete a Query
router.delete('/queries/:queryId', (req, res) => {
  const { queryId } = req.params;

  connection.query('DELETE FROM Queries WHERE queryId = ?', [queryId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Query not found');
    }
    res.status(200).send('Query deleted successfully');
  });
});

module.exports = router;
