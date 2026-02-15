/**
 * Authentication Middleware
 * Protects admin routes and manages user sessions
 */

/**
 * Check if user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  
  // Store the original URL to redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

/**
 * Check if user is already logged in (for login page)
 */
function isLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

/**
 * Attach user data to response locals
 */
function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    res.locals.isAuthenticated = true;
    res.locals.username = req.session.username;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
}

app.use('/admin', adminRoutes);

module.exports = {
  isAuthenticated,
  isLoggedIn,
  attachUser
};
