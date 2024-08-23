// loginRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../config/db');

const SECRET_KEY = 'crm-system'; // Replace with your actual secret key

// Login for Admin
router.post('/login/admin', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM Admin WHERE username = ?', [username], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send('Admin not found');
    }

    const admin = results[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: admin.adminId, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ token });
  });
});

router.post('/login/agent', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM Agent WHERE username = ?', [username], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send('Agent not found');
    }

    const agent = results[0];

    // Check if the agent is active
    if (agent.isActive !== 'active') {
      return res.status(403).send('Agent is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: agent.agentId, role: 'agent' }, SECRET_KEY, { expiresIn: '1h' });

    // Respond with both token and agentId
    res.status(200).json({ token, id: agent.agentId });
  });
});


// Login for Manager
router.post('/login/manager', (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM Manager WHERE username = ?', [username], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send('Manager not found');
    }

    const manager = results[0];
    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ id: manager.managerId, role: 'manager' }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ token });
  });
});

module.exports = router;
