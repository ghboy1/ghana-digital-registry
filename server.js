const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'ghana-registry-secret-2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Routes
app.use('/', require('./routes/main'));
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🇬🇭 Ghana Birth & Death Registry System running on http://localhost:${PORT}`);
  console.log(`System started successfully! Open your browser and visit the URL above.`);
});
// Add with other route imports
app.use('/certificates', require('./routes/certificates'));