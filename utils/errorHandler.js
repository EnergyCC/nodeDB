/**
 * Centralized error handling utilities
 */

/**
 * Handle database errors
 * @param {Error} err - The error object
 * @param {string} operation - Description of the operation that failed
 * @returns {string} User-friendly error message
 */
function handleDatabaseError(err, operation = 'operation') {
  console.error(`Database error during ${operation}:`, err);
  
  // Log the actual error for debugging
  if (err.sqlMessage) {
    console.error('SQL Error:', err.sqlMessage);
  }
  
  // Return user-friendly message
  return 'A apărut o eroare la baza de date. Vă rugăm încercați din nou.';
}

/**
 * Handle JSON parsing errors
 * @param {Error} err - The error object
 * @param {string} context - Context where the error occurred
 * @returns {string} User-friendly error message
 */
function handleJsonError(err, context = 'operation') {
  console.error(`JSON parsing error during ${context}:`, err);
  return 'A apărut o eroare la procesarea datelor. Vă rugăm încercați din nou.';
}

/**
 * Handle validation errors
 * @param {Array} errors - Array of validation errors
 * @returns {Array} Formatted error messages
 */
function handleValidationErrors(errors) {
  if (!Array.isArray(errors)) {
    console.warn('handleValidationErrors called with non-array:', errors);
    return [{ text: 'A apărut o eroare de validare.' }];
  }
  
  return errors.map(error => {
    if (typeof error === 'string') {
      return { text: error };
    } else if (error && error.text) {
      return error;
    } else {
      return { text: 'A apărut o eroare de validare.' };
    }
  });
}

module.exports = {
  handleDatabaseError,
  handleJsonError,
  handleValidationErrors
};