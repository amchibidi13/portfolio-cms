const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const { loadSiteConfig } = require('./middleware/siteConfig');
const { attachUser } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errors');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error.message);
  console.error('Please check your .env file and ensure TURSO_DATABASE_URL is set correctly.');
  process.exit(1);
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Custom middleware
app.use(attachUser);
app.use(loadSiteConfig);

// Routes
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 Portfolio CMS Server Running                        ║
║                                                            ║
║     📍 Local:            http://localhost:${PORT}            ║
║     🔐 Admin Panel:      http://localhost:${PORT}/admin     ║
║                                                            ║
║     Environment:         ${process.env.NODE_ENV || 'development'}                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
