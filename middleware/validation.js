/**
 * Input validation middleware
 */

/**
 * Validate required fields
 * @param {Array} fields - Array of field names that are required
 * @returns {Function} Express middleware function
 */
function validateRequired(fields) {
  return (req, res, next) => {
    const errors = [];
    
    fields.forEach(field => {
      const value = req.body[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        errors.push({ field, text: `${field} este obligatoriu` });
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }
    
    next();
  };
}

/**
 * Validate string fields with optional constraints
 * @param {Object} constraints - Object with field names as keys and validation rules as values
 * @returns {Function} Express middleware function
 */
function validateStringFields(constraints) {
  return (req, res, next) => {
    const errors = [];
    
    Object.keys(constraints).forEach(field => {
      const value = req.body[field];
      const rules = constraints[field];
      
      // Skip validation if field is not required and not provided
      if (!rules.required && (!value || value.trim().length === 0)) {
        return;
      }
      
      // Check if required
      if (rules.required && (!value || value.trim().length === 0)) {
        errors.push({ field, text: `${field} este obligatoriu` });
        return;
      }
      
      // Check type
      if (value && typeof value !== 'string') {
        errors.push({ field, text: `${field} trebuie să fie un text` });
        return;
      }
      
      // Check min length
      if (rules.minLength && value && value.trim().length < rules.minLength) {
        errors.push({ field, text: `${field} trebuie să aibă cel puțin ${rules.minLength} caractere` });
        return;
      }
      
      // Check max length
      if (rules.maxLength && value && value.trim().length > rules.maxLength) {
        errors.push({ field, text: `${field} trebuie să aibă maximum ${rules.maxLength} caractere` });
        return;
      }
      
      // Check regex pattern
      if (rules.pattern && value && !rules.pattern.test(value.trim())) {
        errors.push({ field, text: rules.patternMessage || `${field} nu are formatul corect` });
        return;
      }
    });
    
    if (errors.length > 0) {
      // For form submissions, render the form with errors
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Get the referring route to determine which template to render
        const referrer = req.get('Referer') || '/';
        const routePath = referrer.split('/').pop();
        
        // Default values
        const defaultValues = {
          url: req.originalUrl,
          mth: req.method
        };
        
        // Add all form fields to default values
        Object.keys(req.body).forEach(key => {
          defaultValues[key] = req.body[key];
        });
        
        // Add errors
        defaultValues.errors = errors;
        
        return res.render('add', defaultValues);
      }
      
      // For API requests, return JSON
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }
    
    next();
  };
}

/**
 * Validate numeric fields
 * @param {Object} constraints - Object with field names as keys and validation rules as values
 * @returns {Function} Express middleware function
 */
function validateNumericFields(constraints) {
  return (req, res, next) => {
    const errors = [];
    
    Object.keys(constraints).forEach(field => {
      const value = req.body[field];
      const rules = constraints[field];
      
      // Skip validation if field is not required and not provided
      if (!rules.required && value === undefined) {
        return;
      }
      
      // Check if required
      if (rules.required && (value === undefined || value === null)) {
        errors.push({ field, text: `${field} este obligatoriu` });
        return;
      }
      
      // Skip further validation if not provided and not required
      if (value === undefined || value === null) {
        return;
      }
      
      // Convert to number if it's a string
      let numValue = value;
      if (typeof value === 'string') {
        numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push({ field, text: `${field} trebuie să fie un număr` });
          return;
        }
      }
      
      // Check if it's a number
      if (typeof numValue !== 'number') {
        errors.push({ field, text: `${field} trebuie să fie un număr` });
        return;
      }
      
      // Check min value
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push({ field, text: `${field} trebuie să fie cel puțin ${rules.min}` });
        return;
      }
      
      // Check max value
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push({ field, text: `${field} trebuie să fie maximum ${rules.max}` });
        return;
      }
    });
    
    if (errors.length > 0) {
      // For form submissions, render the form with errors
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // Get the referring route to determine which template to render
        const referrer = req.get('Referer') || '/';
        const routePath = referrer.split('/').pop();
        
        // Default values
        const defaultValues = {
          url: req.originalUrl,
          mth: req.method
        };
        
        // Add all form fields to default values
        Object.keys(req.body).forEach(key => {
          defaultValues[key] = req.body[key];
        });
        
        // Add errors
        defaultValues.errors = errors;
        
        return res.render('add', defaultValues);
      }
      
      // For API requests, return JSON
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }
    
    next();
  };
}

module.exports = {
  validateRequired,
  validateStringFields,
  validateNumericFields
};