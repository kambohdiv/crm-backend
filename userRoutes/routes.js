const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const bcrypt = require('bcrypt');

// CRUD for Agent
// POST /agent - Add a New Agent
router.post('/agent', async (req, res) => {
  const { name, contactNumber, email, username, password, isActive } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'INSERT INTO Agent (name, contactNumber, email, username, password, isActive) VALUES (?, ?, ?, ?, ?, ?)',
    [name, contactNumber, email, username, hashedPassword, isActive],
    (err, results) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err);
       
      }
      res.status(201).send('Agent added successfully');
    }
  );
});

// GET /agent - Retrieve All Agents
router.get('/agent', (req, res) => {
  connection.query('SELECT * FROM Agent', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

// GET /agent/:id - Retrieve a Single Agent by ID
router.get('/agent/:id', (req, res) => {
  connection.query('SELECT * FROM Agent WHERE agentId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

// PUT /agent/:id - Update an Existing Agent
router.put('/agent/:id', async (req, res) => {
  const { name, contactNumber, email, username, password, isActive } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'UPDATE Agent SET name = ?, contactNumber = ?, email = ?, username = ?, password = ?, isActive = ? WHERE agentId = ?',
    [name, contactNumber, email, username, hashedPassword, isActive, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Agent updated successfully');
    }
  );
});

// PUT /agent/:id/activate - Toggle the active status of an Agent
router.put('/agent/:id/activate', (req, res) => {
  // First, fetch the current isActive status of the agent
  connection.query(
    'SELECT isActive FROM Agent WHERE agentId = ?',
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      if (results.length === 0) {
        return res.status(404).send('Agent not found');
      }

      // Toggle the isActive status
      const currentStatus = results[0].isActive;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      // Update the isActive status in the database
      connection.query(
        'UPDATE Agent SET isActive = ? WHERE agentId = ?',
        [newStatus, req.params.id],
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).send(err);
          }
          res.status(200).send(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        }
      );
    }
  );
});


// CRUD for Queries

// POST /query - Add a New Query
router.post('/query', (req, res) => {
  const { full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate } = req.body;
  connection.query(
    'INSERT INTO Queries (full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate],
    (err, results) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err);
      }
      res.status(201).send('Query added successfully');
    }
  );
});

// GET /query - Retrieve All Queries
router.get('/query', (req, res) => {
  const query = `
    SELECT 
      Queries.queryId, 
      Queries.full_name, 
      Queries.phone_number, 
      Queries.Comments, 
      Queries.travelType, 
      Queries.queryType, 
      Queries.leadSource, 
      Queries.priority, 
      Queries.status, 
      Queries.querydate,
      Queries.TravelTime, 
      Queries.TravelDate, 
      Queries.editReasons, -- Ensure this column exists in your database
      Agent.name AS agentName
    FROM Queries
    LEFT JOIN Agent ON Queries.agentId = Agent.agentId
  `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

// GET /query/:id - Retrieve a Single Query by ID
router.get('/query/:id', (req, res) => {
  connection.query('SELECT * FROM Queries WHERE queryId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

// PUT /query/:id - Update an Existing Query
router.put('/query/:id', (req, res) => {
  const { full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate, editReason } = req.body;
  
  // Fetch current edit reasons from the database
  connection.query('SELECT editReasons FROM Queries WHERE queryId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    let currentEditReasons = results[0]?.editReasons || '[]'; // Default to an empty array if null
    let newEditReasons;

    try {
      currentEditReasons = JSON.parse(currentEditReasons); // Parse the current edit reasons JSON string
    } catch (parseError) {
      currentEditReasons = []; // Fallback to empty array on parse error
    }

    if (editReason) {
      currentEditReasons.push(editReason); // Append new edit reason
      newEditReasons = JSON.stringify(currentEditReasons); // Convert back to JSON string for storage
    }

    connection.query(
      'UPDATE Queries SET full_name = ?, phone_number = ?, Comments = ?, travelType = ?, queryType = ?, leadSource = ?, priority = ?, agentId = ?, status = ?, TravelTime = ?, TravelDate = ?, editReasons = ? WHERE queryId = ?',
      [full_name, phone_number, Comments, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate, newEditReasons, req.params.id],
      (err, results) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send('Query updated successfully');
      }
    );
  });
});

// DELETE /query/:id - Delete a Query
router.delete('/query/:id', (req, res) => {
  connection.query('DELETE FROM Queries WHERE queryId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Query deleted successfully');
  });
});

// CRUD for Admin
router.post('/admin', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'INSERT INTO Admin (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Admin added successfully');
    }
  );
});

router.get('/admin', (req, res) => {
  connection.query('SELECT * FROM Admin', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

router.get('/admin/:id', (req, res) => {
  connection.query('SELECT * FROM Admin WHERE adminId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

router.put('/admin/:id', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'UPDATE Admin SET username = ?, password = ? WHERE adminId = ?',
    [username, hashedPassword, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Admin updated successfully');
    }
  );
});

router.delete('/admin/:id', (req, res) => {
  connection.query('DELETE FROM Admin WHERE adminId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Admin deleted successfully');
  });
});

// CRUD for Manager
// POST /manager - Add a New Manager
router.post('/manager', async (req, res) => {
  const { name, contactNumber, email, username, password, isActive } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'INSERT INTO Manager (name, contactNumber, email, username, password, isActive) VALUES (?, ?, ?, ?, ?, ?)',
    [name, contactNumber, email, username, hashedPassword, isActive],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      res.status(201).send('Manager added successfully');
    }
  );
});

// GET /manager - Retrieve All Managers
router.get('/manager', (req, res) => {
  connection.query('SELECT * FROM Manager', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

// GET /manager/:id - Retrieve a Single Manager by ID
router.get('/manager/:id', (req, res) => {
  connection.query('SELECT * FROM Manager WHERE managerId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

// PUT /manager/:id - Update an Existing Manager
router.put('/manager/:id', async (req, res) => {
  const { name, contactNumber, email, username, password, isActive } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'UPDATE Manager SET name = ?, contactNumber = ?, email = ?, username = ?, password = ?, isActive = ? WHERE managerId = ?',
    [name, contactNumber, email, username, hashedPassword, isActive, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Manager updated successfully');
    }
  );
});



router.put('/manager/:id/activate', (req, res) => {
  // First, fetch the current isActive status of the agent
  connection.query(
    'SELECT isActive FROM  Manager WHERE managerId = ?',
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      if (results.length === 0) {
        return res.status(404).send('Manager not found');
      }

      // Toggle the isActive status
      const currentStatus = results[0].isActive;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      // Update the isActive status in the database
      connection.query(
        'UPDATE Manager SET isActive = ? WHERE managerId = ?',
        [newStatus, req.params.id],
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).send(err);
          }
          res.status(200).send(`Manager ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        }
      );
    }
  );
});
// Export the router
module.exports = router;
