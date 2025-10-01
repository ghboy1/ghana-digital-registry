const express = require('express');
const db = require('../database/database');
const certificateGenerator = require('../utils/certificateGenerator');
const router = express.Router();

// Generate Birth Certificate
router.get('/birth/:registrationNumber', (req, res) => {
  const { registrationNumber } = req.params;

  db.get('SELECT * FROM births WHERE registration_number = ?', [registrationNumber], (err, birthRecord) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!birthRecord) {
      return res.status(404).json({ error: 'Birth record not found' });
    }

    try {
      certificateGenerator.generateBirthCertificate(birthRecord, res);
    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({ error: 'Failed to generate certificate' });
    }
  });
});

// Generate Death Certificate
router.get('/death/:registrationNumber', (req, res) => {
  const { registrationNumber } = req.params;

  db.get('SELECT * FROM deaths WHERE registration_number = ?', [registrationNumber], (err, deathRecord) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!deathRecord) {
      return res.status(404).json({ error: 'Death record not found' });
    }

    try {
      certificateGenerator.generateDeathCertificate(deathRecord, res);
    } catch (error) {
      console.error('Certificate generation error:', error);
      res.status(500).json({ error: 'Failed to generate certificate' });
    }
  });
});

// Preview Certificate (HTML version for quick view)
router.get('/preview/birth/:registrationNumber', (req, res) => {
  const { registrationNumber } = req.params;

  db.get('SELECT * FROM births WHERE registration_number = ?', [registrationNumber], (err, birthRecord) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!birthRecord) {
      return res.status(404).json({ error: 'Birth record not found' });
    }

    res.json({
      type: 'birth',
      data: birthRecord,
      preview: true
    });
  });
});

router.get('/preview/death/:registrationNumber', (req, res) => {
  const { registrationNumber } = req.params;

  db.get('SELECT * FROM deaths WHERE registration_number = ?', [registrationNumber], (err, deathRecord) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!deathRecord) {
      return res.status(404).json({ error: 'Death record not found' });
    }

    res.json({
      type: 'death',
      data: deathRecord,
      preview: true
    });
  });
});

module.exports = router;