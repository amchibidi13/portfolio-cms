/**
 * Error Handling Middleware
 * Provides centralized error handling for the application
 */

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).render('error', {
    statusCode: 404,
    message: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    siteConfig: res.locals.siteConfig || {}
  });
}

/**
 * Global Error Handler
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).render('error', {
    statusCode,
    message: isDevelopment ? message : 'Something went wrong',
    description: isDevelopment ? err.stack : 'Please try again later.',
    siteConfig: res.locals.siteConfig || {}
  });
}

/**
 * Async Route Handler Wrapper
 * Catches errors in async route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler
};
