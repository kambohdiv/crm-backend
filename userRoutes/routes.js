const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const bcrypt = require('bcrypt');

// CRUD for Agent
router.post('/agent', async (req, res) => {
  const { name, contactNumber, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'INSERT INTO Agent (name, contactNumber, email, username, password) VALUES (?, ?, ?, ?, ?)',
    [name, contactNumber, email, username, hashedPassword],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Agent added successfully');
    }
  );
});

router.get('/agent', (req, res) => {
  connection.query('SELECT * FROM Agent', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

router.get('/agent/:id', (req, res) => {
  connection.query('SELECT * FROM Agent WHERE agentId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).json(results[0]);
  });
});

router.put('/agent/:id', async (req, res) => {
  const { name, contactNumber, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  connection.query(
    'UPDATE Agent SET name = ?, contactNumber = ?, email = ?, username = ?, password = ? WHERE agentId = ?',
    [name, contactNumber, email, username, hashedPassword, req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Agent updated successfully');
    }
  );
});

router.delete('/agent/:id', (req, res) => {
  connection.query('DELETE FROM Agent WHERE agentId = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Agent deleted successfully');
  });
});

// CRUD for Queries
router.post('/query', (req, res) => {
  const { type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status } = req.body;
  connection.query(
    'INSERT INTO Queries (type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Query added successfully');
    }
  );
});

router.get('/query', (req, res) => {
  connection.query('SELECT * FROM Queries', (err, results) => {
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
  const { type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status } = req.body;
  connection.query(
    'UPDATE Queries SET type = ?, queryData = ?, destination = ?, travelType = ?, queryType = ?, leadSource = ?, priority = ?, agentId = ?, status = ? WHERE queryId = ?',
    [type, queryData, destination, travelType, queryType, leadSource, priority, agentId, status, req.params.id],
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
