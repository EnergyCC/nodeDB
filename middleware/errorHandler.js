/**
 * Express middleware for consistent error handling
 */

/**
 * Handle async route functions with proper error handling
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log the error for debugging
  console.error(`${new Date().toISOString()} - Error in ${req.method} ${req.originalUrl}:`, err);
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine error message based on error type
  let userMessage = 'A apărut o eroare. Vă rugăm încercați din nou.';
  
  if (err.code === 'EBADCSRFTOKEN') {
    userMessage = 'Cerere invalidă. Vă rugăm reîncărcați pagina și încercați din nou.';
  } else if (err.type === 'entity.parse.failed') {
    userMessage = 'Formatul datelor este invalid. Vă rugăm verificați datele introduse.';
  } else if (err.type === 'entity.too.large') {
    userMessage = 'Dimensiunea datelor este prea mare. Vă rugăm reduceți dimensiunea fișierelor.';
  }
  
  // For API endpoints, return JSON error
  if (req.originalUrl.startsWith('/api/') || req.xhr) {
    return res.status(err.status || 500).json({
      success: false,
      error: isDevelopment ? err.message : userMessage,
      ...(isDevelopment && { stack: err.stack })
    });
  }
  
  // For regular routes, render error page
  res.status(err.status || 500).render('errors', {
    error: isDevelopment ? `${userMessage} (${err.message})` : userMessage
  });
}

/**
 * Handle 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

module.exports = {
  asyncHandler,
  errorHandler,
  notFoundHandler
};