const crypto = require('crypto');

/**
 * Generate a random CSRF token
 * @returns {string} - A random CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to initialize CSRF protection
 * Adds a CSRF token to the session and locals
 */
function csrfInit(req, res, next) {
  // Initialize session if it doesn't exist
  if (!req.session) {
    req.session = {};
  }
  
  // Generate a new CSRF token if one doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Make the token available in templates
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
}

/**
 * Middleware to validate CSRF token
 * Checks that the submitted token matches the session token
 */
function csrfValidation(req, res, next) {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Get token from request
  const submittedToken = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
  
  // Validate token
  if (!submittedToken || !req.session.csrfToken || submittedToken !== req.session.csrfToken) {
    return res.status(403).render('errors', {
      error: 'Cerere invalidă. Vă rugăm încercați din nou.'
    });
  }
  
  next();
}

module.exports = {
  csrfInit,
  csrfValidation
};