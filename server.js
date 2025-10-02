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

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ghana Birth and Death Registry API is running!',
    status: 'OK'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

// Routes
app.use('/', require('./routes/main'));
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));
app.use('/certificates', require('./routes/certificates'));

// Start server - CRITICAL FOR RAILWAY
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`System started successfully! Open your browser and visit the URL above.`);
});