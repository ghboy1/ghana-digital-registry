const express = require('express');
const db = require('../database/database');

// Try to import validation, fallback to simple validation
let ghanaValidation;
try {
  ghanaValidation = require('../utils/validation');
  console.log('Using main validation module');
} catch (error) {
  console.log('Main validation failed, using simple validation:', error.message);
  ghanaValidation = require('../utils/simpleValidation');
}

const router = express.Router();

// Add debug logging to check if validation functions exist
console.log('Validation functions available:', {
  validateBirthRegistration: typeof ghanaValidation.validateBirthRegistration,
  validateDeathRegistration: typeof ghanaValidation.validateDeathRegistration
});

// ... rest of your API code

// Generate registration number
function generateRegistrationNumber(type) {
  const prefix = type === 'birth' ? 'BR' : 'DR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}GH${timestamp}${random}`;
}

// Birth registration endpoint with validation
router.post('/births', (req, res) => {
  try {
    console.log('Received birth registration data:', req.body);
    
    // Validate the birth registration data
    if (!ghanaValidation.validateBirthRegistration) {
      throw new Error('validateBirthRegistration function not found');
    }
    
    const validation = ghanaValidation.validateBirthRegistration(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors 
      });
    }

    const registrationNumber = generateRegistrationNumber('birth');
    
    const {
      child_first_name, child_last_name, child_other_names,
      date_of_birth, time_of_birth, place_of_birth,
      gender, weight_kg, mother_first_name, mother_last_name,
      mother_national_id, father_first_name, father_last_name,
      father_national_id, informant_name, informant_relationship,
      informant_contact
    } = req.body;

    const sql = `INSERT INTO births (
      registration_number, child_first_name, child_last_name, child_other_names,
      date_of_birth, time_of_birth, place_of_birth, gender, weight_kg,
      mother_first_name, mother_last_name, mother_national_id,
      father_first_name, father_last_name, father_national_id,
      informant_name, informant_relationship, informant_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      registrationNumber, child_first_name, child_last_name, child_other_names,
      date_of_birth, time_of_birth, place_of_birth, gender, weight_kg,
      mother_first_name, mother_last_name, mother_national_id,
      father_first_name, father_last_name, father_national_id,
      informant_name, informant_relationship, informant_contact
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save birth registration: ' + err.message });
      }
      res.json({ 
        success: true, 
        registrationNumber: registrationNumber,
        message: 'Birth registration submitted successfully!'
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Death registration endpoint with validation
router.post('/deaths', (req, res) => {
  try {
    // Validate the death registration data
    const validation = ghanaValidation.validateDeathRegistration(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: validation.errors 
      });
    }

    const registrationNumber = generateRegistrationNumber('death');
    
    const {
      deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death,
      age_at_death, gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    } = req.body;

    const sql = `INSERT INTO deaths (
      registration_number, deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death, age_at_death,
      gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      registrationNumber, deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death, age_at_death,
      gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save death registration: ' + err.message });
      }
      res.json({ 
        success: true, 
        registrationNumber: registrationNumber,
        message: 'Death registration submitted successfully!'
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ... rest of your existing API endpoints remain the same
// Death registration endpoint
router.post('/deaths', (req, res) => {
  try {
    const registrationNumber = generateRegistrationNumber('death');
    
    const {
      deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death,
      age_at_death, gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    } = req.body;

    const sql = `INSERT INTO deaths (
      registration_number, deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death, age_at_death,
      gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [
      registrationNumber, deceased_first_name, deceased_last_name, deceased_other_names,
      date_of_death, time_of_death, place_of_death, cause_of_death, age_at_death,
      gender, nationality, occupation, marital_status,
      informant_name, informant_relationship, informant_contact
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save death registration: ' + err.message });
      }
      res.json({ 
        success: true, 
        registrationNumber: registrationNumber,
        message: 'Death registration submitted successfully!'
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get all births (for testing)
router.get('/births', (req, res) => {
  db.all("SELECT * FROM births ORDER BY registration_date DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all deaths (for testing)
router.get('/deaths', (req, res) => {
  db.all("SELECT * FROM deaths ORDER BY registration_date DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Advanced search endpoints
router.get('/search/advanced/births', (req, res) => {
  const {
    firstName,
    lastName,
    dateFrom,
    dateTo,
    place,
    motherName,
    fatherName,
    registrationNumber
  } = req.query;

  let sql = `SELECT * FROM births WHERE 1=1`;
  const params = [];

  if (firstName) {
    sql += ` AND child_first_name LIKE ?`;
    params.push(`%${firstName}%`);
  }

  if (lastName) {
    sql += ` AND child_last_name LIKE ?`;
    params.push(`%${lastName}%`);
  }

  if (dateFrom) {
    sql += ` AND date_of_birth >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND date_of_birth <= ?`;
    params.push(dateTo);
  }

  if (place) {
    sql += ` AND place_of_birth LIKE ?`;
    params.push(`%${place}%`);
  }

  if (motherName) {
    sql += ` AND (mother_first_name LIKE ? OR mother_last_name LIKE ?)`;
    params.push(`%${motherName}%`, `%${motherName}%`);
  }

  if (fatherName) {
    sql += ` AND (father_first_name LIKE ? OR father_last_name LIKE ?)`;
    params.push(`%${fatherName}%`, `%${fatherName}%`);
  }

  if (registrationNumber) {
    sql += ` AND registration_number LIKE ?`;
    params.push(`%${registrationNumber}%`);
  }

  sql += ` ORDER BY registration_date DESC LIMIT 100`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json(rows);
  });
});

router.get('/search/advanced/deaths', (req, res) => {
  const {
    firstName,
    lastName,
    dateFrom,
    dateTo,
    place,
    cause,
    ageFrom,
    ageTo,
    registrationNumber
  } = req.query;

  let sql = `SELECT * FROM deaths WHERE 1=1`;
  const params = [];

  if (firstName) {
    sql += ` AND deceased_first_name LIKE ?`;
    params.push(`%${firstName}%`);
  }

  if (lastName) {
    sql += ` AND deceased_last_name LIKE ?`;
    params.push(`%${lastName}%`);
  }

  if (dateFrom) {
    sql += ` AND date_of_death >= ?`;
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ` AND date_of_death <= ?`;
    params.push(dateTo);
  }

  if (place) {
    sql += ` AND place_of_death LIKE ?`;
    params.push(`%${place}%`);
  }

  if (cause) {
    sql += ` AND cause_of_death LIKE ?`;
    params.push(`%${cause}%`);
  }

  if (ageFrom) {
    sql += ` AND age_at_death >= ?`;
    params.push(parseInt(ageFrom));
  }

  if (ageTo) {
    sql += ` AND age_at_death <= ?`;
    params.push(parseInt(ageTo));
  }

  if (registrationNumber) {
    sql += ` AND registration_number LIKE ?`;
    params.push(`%${registrationNumber}%`);
  }

  sql += ` ORDER BY registration_date DESC LIMIT 100`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json(rows);
  });
});

// Get statistics for dashboard
router.get('/stats', (req, res) => {
  const stats = {};
  
  // Get total births
  db.get("SELECT COUNT(*) as count FROM births", (err, birthRow) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalBirths = birthRow.count;
    
    // Get total deaths
    db.get("SELECT COUNT(*) as count FROM deaths", (err, deathRow) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalDeaths = deathRow.count;
      
      // Get today's registrations
      db.get("SELECT COUNT(*) as count FROM births WHERE DATE(registration_date) = DATE('now')", (err, todayBirths) => {
        stats.todayBirths = todayBirths.count;
        
        db.get("SELECT COUNT(*) as count FROM deaths WHERE DATE(registration_date) = DATE('now')", (err, todayDeaths) => {
          stats.todayDeaths = todayDeaths.count;
          stats.todayTotal = stats.todayBirths + stats.todayDeaths;
          
          res.json(stats);
        });
      });
    });
  });
});

// Get all records with pagination
router.get('/records/:type', (req, res) => {
  const type = req.params.type;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  if (type !== 'births' && type !== 'deaths') {
    return res.status(400).json({ error: 'Invalid record type' });
  }
  
  const table = type;
  const sql = `SELECT * FROM ${table} ORDER BY registration_date DESC LIMIT ? OFFSET ?`;
  
  db.all(sql, [limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;