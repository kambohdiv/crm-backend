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
router.post('/query', (req, res) => {
  const { type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate } = req.body;
  connection.query(
    'INSERT INTO Queries (type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate],
    (err, results) => {
      if (err) {
        console.log(err)
        return res.status(500).send(err);
      }
      res.status(201).send('Query added successfully');
    }
  );
});

router.get('/query', (req, res) => {
  const query = `
    SELECT 
      Queries.queryId, 
      Queries.type, 
      Queries.queryData, 
      Queries.destination, 
      Queries.travelType, 
      Queries.queryType, 
      Queries.leadSource, 
      Queries.priority, 
      Queries.status, 
      Queries.querydate,
      Queries.TravelTime, 
      Queries.TravelDate, 
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


router.get('/query/:id', (req, res) => {
  connection.query('SELECT * FROM Queries WHERE queryId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

router.put('/query/:id', (req, res) => {
  const { type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate } = req.body;
  connection.query(
    'UPDATE Queries SET type = ?, queryData = ?, destination = ?, travelType = ?, queryType = ?, leadSource = ?, priority = ?, agentId = ?, status = ?, TravelTime = ?, TravelDate = ? WHERE queryId = ?',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, TravelTime, TravelDate, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Query updated successfully');
    }
  );
});

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
router.post('/manager', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'INSERT INTO Manager (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Manager added successfully');
    }
  );
});

router.get('/manager', (req, res) => {
  connection.query('SELECT * FROM Manager', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

router.get('/manager/:id', (req, res) => {
  connection.query('SELECT * FROM Manager WHERE managerId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

router.put('/manager/:id', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'UPDATE Manager SET username = ?, password = ? WHERE managerId = ?',
    [username, hashedPassword, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Manager updated successfully');
    }
  );
});

router.delete('/manager/:id', (req, res) => {
  connection.query('DELETE FROM Manager WHERE managerId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Manager deleted successfully');
  });
});

// Export the router
module.exports = router;
