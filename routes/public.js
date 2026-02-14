const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errors');
const publicController = require('../controllers/publicController');

// Home page
router.get('/', asyncHandler(publicController.renderPage));

// Dynamic page rendering
router.get('/:slug', asyncHandler(publicController.renderPage));

// Contact form submission
router.post('/contact', asyncHandler(publicController.submitContactForm));

// Project detail page
router.get('/project/:slug', asyncHandler(publicController.viewProject));

// Article detail page
router.get('/article/:slug', asyncHandler(publicController.viewArticle));

module.exports = router;
