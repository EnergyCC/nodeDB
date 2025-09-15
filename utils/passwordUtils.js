const bcrypt = require('bcrypt');

/**
 * Hash a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 * @throws {Error} - If there's an error during hashing
 */
async function hashPassword(password) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} storedPassword - The stored password (could be hashed or plain text)
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 * @throws {Error} - If there's an error during comparison
 */
async function comparePassword(password, storedPassword) {
  try {
    // If it looks like a bcrypt hash, use bcrypt comparison
    if (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$')) {
      const isMatch = await bcrypt.compare(password, storedPassword);
      return isMatch;
    } else {
      // Otherwise, do a plain text comparison for legacy passwords
      return password === storedPassword;
    }
  } catch (error) {
    // If bcrypt comparison fails, fall back to plain text comparison
    return password === storedPassword;
  }
}

module.exports = {
  hashPassword,
  comparePassword
};