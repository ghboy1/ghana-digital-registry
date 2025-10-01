const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'registry.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  // Births table
  db.run(`CREATE TABLE IF NOT EXISTS births (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT UNIQUE,
    child_first_name TEXT NOT NULL,
    child_last_name TEXT NOT NULL,
    child_other_names TEXT,
    date_of_birth DATE NOT NULL,
    time_of_birth TIME,
    place_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL,
    weight_kg REAL,
    mother_first_name TEXT NOT NULL,
    mother_last_name TEXT NOT NULL,
    mother_national_id TEXT,
    father_first_name TEXT NOT NULL,
    father_last_name TEXT NOT NULL,
    father_national_id TEXT,
    informant_name TEXT,
    informant_relationship TEXT,
    informant_contact TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  )`);

  // Deaths table
  db.run(`CREATE TABLE IF NOT EXISTS deaths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT UNIQUE,
    deceased_first_name TEXT NOT NULL,
    deceased_last_name TEXT NOT NULL,
    deceased_other_names TEXT,
    date_of_death DATE NOT NULL,
    time_of_death TIME,
    place_of_death TEXT NOT NULL,
    cause_of_death TEXT,
    age_at_death INTEGER,
    gender TEXT NOT NULL,
    nationality TEXT DEFAULT 'Ghanaian',
    occupation TEXT,
    marital_status TEXT,
    informant_name TEXT,
    informant_relationship TEXT,
    informant_contact TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  )`);

  // Users table for registry officials
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'clerk',
    district TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add a default admin user (password: admin123)
  const defaultPassword = 'admin123';
  const hash = bcrypt.hashSync(defaultPassword, 10);
  
  db.run(`INSERT OR IGNORE INTO users (username, password_hash, full_name, role, district) 
          VALUES (?, ?, ?, ?, ?)`, 
          ['admin', hash, 'System Administrator', 'admin', 'Accra'], 
          function(err) {
            if (err) {
              console.error('Error creating default user:', err);
            } else {
              if (this.changes > 0) {
                console.log('Default admin user created: admin / admin123');
              }
            }
          });

  console.log('Database tables initialized successfully');
});

module.exports = db;