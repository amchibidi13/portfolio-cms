const express = require('express');
const router = express.Router();
const { isAuthenticated, isLoggedIn } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const adminController = require('../controllers/adminController');

// Login routes
router.get('/login', isLoggedIn, adminController.showLogin);
router.post('/login', asyncHandler(adminController.handleLogin));
router.get('/logout', adminController.handleLogout);

// Protected admin routes
router.get('/dashboard', isAuthenticated, asyncHandler(adminController.showDashboard));
router.get('/pages', isAuthenticated, asyncHandler(adminController.showPages));
router.get('/sections', isAuthenticated, asyncHandler(adminController.showSections));
router.get('/components', isAuthenticated, asyncHandler(adminController.showComponents));
router.get('/config', isAuthenticated, asyncHandler(adminController.showConfig));

// API routes for admin operations
router.post('/api/config', isAuthenticated, asyncHandler(adminController.updateConfig));
router.post('/api/text-content', isAuthenticated, asyncHandler(adminController.updateTextContent));
router.put('/api/components/:id', isAuthenticated, asyncHandler(adminController.updateComponent));

router.post('/api/pages', isAuthenticated, asyncHandler(adminController.createPage));
router.post('/api/sections', isAuthenticated, asyncHandler(adminController.createSection));
router.post('/api/components', isAuthenticated, asyncHandler(adminController.createComponent));

router.delete('/api/pages/:id', isAuthenticated, asyncHandler(adminController.deletePage));
router.delete('/api/sections/:id', isAuthenticated, asyncHandler(adminController.deleteSection));
router.delete('/api/components/:id', isAuthenticated, asyncHandler(adminController.deleteComponent));

module.exports = router;
