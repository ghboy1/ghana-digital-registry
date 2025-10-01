const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/database');
const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    if (bcrypt.compareSync(password, user.password_hash)) {
      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        district: user.district
      };
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: req.session.user
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;