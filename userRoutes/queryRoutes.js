const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const CronJob = require('cron').CronJob; // Import the cron package

// Function to check and update the status of queries
const checkAndUpdateQueryStatus = () => {
  // Print to console every time the cron job runs
  console.log('Cron job is running...');

  // Get the current time in hours and minutes
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes(); // Current time in minutes since midnight

  // Query to find all 'assigned' queries
  connection.query('SELECT queryId, assignedTime FROM Queries WHERE status = ?', ['assigned'], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return;
    }

    results.forEach((query) => {
      if (!query.assignedTime) {
        console.log(`Query ID: ${query.queryId} has no assigned time.`);
        return;
      }

      // Convert assignedTime (HH:MM:SS) to minutes since midnight
      const [hours, minutes, seconds] = query.assignedTime.split(':').map(Number);
      const assignedMinutes = hours * 60 + minutes; // Convert hours and minutes to total minutes

      // Calculate the time difference in minutes
      const timeDifference = currentMinutes - assignedMinutes;

      console.log(`Query ID: ${query.queryId}, Assigned Time: ${query.assignedTime}, Time Difference: ${timeDifference} minutes`);

      if (timeDifference > 60) { // If more than 60 minutes have passed
        connection.query('UPDATE Queries SET status = ? WHERE queryId = ?', ['pending', query.queryId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating query status:', updateErr);
          } else {
            console.log(`Query ${query.queryId} status updated to pending.`);
          }
        });
      }
    });
  });
};

// Schedule a cron job to run the check every 3 seconds
const job = new CronJob('*/3 * * * * *', checkAndUpdateQueryStatus);
job.start(); // Start the cron job

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

// Utility function to convert date format
function convertDateFormat(dateString) {
  if (!dateString) return null; // Return null if dateString is undefined or null

  const dateParts = dateString.split('-');

  // Validate that dateParts has three parts: [year, month, day]
  if (dateParts.length !== 3) {
    console.error('Invalid date format:', dateString);
    return null; // or handle the error appropriately
  }

  const year = dateParts[0];
  const month = (dateParts[1] || '').padStart(2, '0'); // Ensure part exists, then padStart
  const day = (dateParts[2] || '').padStart(2, '0');   // Ensure part exists, then padStart

  return `${year}-${month}-${day}`;
}

// Create a new Query
router.post('/queries', (req, res) => {
  const {
    full_name,         // Required field
    phone_number,      // Required field
    Comments,          // Required field
    travelType = '',   // Optional field with default empty string
    queryType = '',    // Optional field with default empty string
    leadSource = '',   // Optional field with default empty string
    priority = '',     // Optional field with default empty string
    agentId = null,    // Optional field, default to null
    status,            // Field can be provided by user; if not, we'll default it to 'assigned'
    TravelTime = null, // Optional field, default to null
    TravelDate = null  // Optional field, default to null
  } = req.body;

  // Set default status to 'pending' if not provided by admin
  const statusValue = status || 'pending';

  // Check if required fields are present
  if (!full_name || !phone_number || !Comments) {
    return res.status(400).send('Missing required fields: full_name, phone_number, Comments');
  }

  // If TravelTime or TravelDate is an empty string, set it to null
  const travelTimeValue = TravelTime === '' ? null : TravelTime;
  const travelDateValue = TravelDate === '' ? null : convertDateFormat(TravelDate); // Convert the date format

  // Automatically capture the current time for assignedTime
  const assignedTime = new Date().toLocaleTimeString('en-GB', { hour12: false }); // Format: HH:MM:SS

  // Automatically capture the current date and time for queryDate
  const queryDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: YYYY-MM-DD HH:MM:SS

  connection.query(
    'INSERT INTO Queries (full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate, queryDate, assignedTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, statusValue, travelTimeValue, travelDateValue, queryDate, assignedTime],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.status(201).send('Query added successfully');
    }
  );
});

// Utility function to convert to MySQL date format
const convertToMySQLDateFormat = (isoDate) => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

// Update the Query with reason for edit
router.put('/queries/:id', (req, res) => {
  const queryId = req.params.id;
  const {
    full_name,
    phone_number,
    Comments,
    travelType,
    queryType,
    leadSource,
    priority,
    agentId,
    status,
    TravelTime,
    TravelDate,
    editReason, // New field to capture the reason for the edit
  } = req.body;

  // Fetch the existing edit reasons from the database
  connection.query('SELECT editReasons FROM Queries WHERE queryId = ?', [queryId], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error fetching current edit reasons:', selectErr);
      return res.status(500).send(selectErr.message);
    }

    // Parse the existing reasons or initialize an empty array
    let existingReasons = [];
    if (selectResults[0].editReasons) {
      existingReasons = JSON.parse(selectResults[0].editReasons);
    }

    // Add the new reason to the existing array
    existingReasons.push(editReason);

    // Convert the updated reasons array to a JSON string
    const updatedReasonsJSON = JSON.stringify(existingReasons);

    // Convert TravelDate to MySQL format if it exists
    const formattedTravelDate = TravelDate ? convertToMySQLDateFormat(TravelDate) : null;

    // Perform the update query with the updated reasons
    connection.query(
      'UPDATE Queries SET full_name = ?, phone_number = ?, Comments = ?, travelType = ?, queryType = ?, leadSource = ?, priority = ?, agentId = ?, status = ?, TravelTime = ?, TravelDate = ?, editReasons = ? WHERE queryId = ?',
      [full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, formattedTravelDate, updatedReasonsJSON, queryId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send(err.message);
        }
        res.status(200).send('Query updated successfully');
      }
    );
  });
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
