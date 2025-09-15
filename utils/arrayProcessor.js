/**
 * Utility functions for processing form arrays consistently
 * This module provides standardized methods for handling array data
 * from HTML forms before saving to the database
 */

/**
 * Process a single array field from form data
 * @param {Object} body - The request body
 * @param {string} fieldName - The name of the field (without [] suffix)
 * @returns {string} - JSON stringified array
 */
function processArrayField(body, fieldName) {
  // NOTE: Express bodyParser automatically removes [] suffix from field names
  const fieldKey = fieldName;
  
  if (Array.isArray(body[fieldKey])) {
    // Filter out truly empty values (null, undefined, empty strings after trim)
    const filtered = body[fieldKey].filter(item => {
      if (item === null || item === undefined) return false;
      return item.toString().trim() !== '';
    });
    return JSON.stringify(filtered);
  } else if (body[fieldKey] !== undefined && body[fieldKey] !== null) {
    // Single value case
    const value = body[fieldKey].toString().trim();
    return value !== '' ? JSON.stringify([value]) : JSON.stringify([]);
  }
  return JSON.stringify([]);
}

/**
 * Process two related array fields (paired data)
 * @param {Object} body - The request body
 * @param {string} field1 - First field name (without [] suffix)
 * @param {string} field2 - Second field name (without [] suffix)
 * @returns {Array<string>} - Array with two JSON stringified arrays
 */
function processPairedArrays(body, field1, field2) {
  const key1 = field1;
  const key2 = field2;
  
  let arr1 = [];
  let arr2 = [];
  
  if (Array.isArray(body[key1]) && Array.isArray(body[key2])) {
    // Both are arrays
    const maxLength = Math.max(body[key1].length, body[key2].length);
    for (let i = 0; i < maxLength; i++) {
      const val1 = (body[key1][i] || '').toString().trim();
      const val2 = (body[key2][i] || '').toString().trim();
      arr1.push(val1);
      arr2.push(val2);
    }
  } else if (body[key1] !== undefined && body[key2] !== undefined) {
    // Both are single values
    const val1 = body[key1].toString().trim();
    const val2 = body[key2].toString().trim();
    arr1.push(val1);
    arr2.push(val2);
  }
  // Handle case where one exists and the other doesn't
  
  return [JSON.stringify(arr1), JSON.stringify(arr2)];
}

/**
 * Process three related array fields (triplet data)
 * @param {Object} body - The request body
 * @param {string} field1 - First field name (without [] suffix)
 * @param {string} field2 - Second field name (without [] suffix)
 * @param {string} field3 - Third field name (without [] suffix)
 * @returns {Array<string>} - Array with three JSON stringified arrays
 */
function processTripleArrays(body, field1, field2, field3) {
  const key1 = field1;
  const key2 = field2;
  const key3 = field3;
  
  let arr1 = [];
  let arr2 = [];
  let arr3 = [];
  
  if (Array.isArray(body[key1]) && Array.isArray(body[key2]) && Array.isArray(body[key3])) {
    // All are arrays
    const maxLength = Math.max(body[key1].length, body[key2].length, body[key3].length);
    for (let i = 0; i < maxLength; i++) {
      const val1 = (body[key1][i] || '').toString().trim();
      const val2 = (body[key2][i] || '').toString().trim();
      const val3 = (body[key3][i] || '').toString().trim();
      arr1.push(val1);
      arr2.push(val2);
      arr3.push(val3);
    }
  } else if (body[key1] !== undefined && body[key2] !== undefined && body[key3] !== undefined) {
    // All are single values
    const val1 = body[key1].toString().trim();
    const val2 = body[key2].toString().trim();
    const val3 = body[key3].toString().trim();
    arr1.push(val1);
    arr2.push(val2);
    arr3.push(val3);
  }
  
  return [JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3)];
}

module.exports = {
  processArrayField,
  processPairedArrays,
  processTripleArrays
};