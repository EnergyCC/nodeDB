const mysql = require('mysql');
const { hashPassword } = require('./utils/passwordUtils');
require('dotenv').config();

// Create a connection pool for better performance
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  reconnectDelay: 2000,
  reconnectDelayMax: 60000,
  reconnectAttempts: 10
});

// Function to update all existing passwords to hashed versions
async function hashExistingPasswords() {
  try {
    // Get all users
    const users = await new Promise((resolve, reject) => {
      pool.query('SELECT user_id, username, password FROM users', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log(`Found ${users.length} users to process`);

    // Process each user
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log(`User ${user.username} already has a hashed password, skipping...`);
        continue;
      }

      console.log(`Hashing password for user ${user.username}...`);
      
      // Hash the password
      const hashedPassword = await hashPassword(user.password);
      
      // Update the user record
      await new Promise((resolve, reject) => {
        pool.query(
          'UPDATE users SET password = ? WHERE user_id = ?',
          [hashedPassword, user.user_id],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      console.log(`Successfully updated password for user ${user.username}`);
    }
    
    console.log('All passwords have been processed');
    pool.end();
  } catch (error) {
    console.error('Error hashing passwords:', error);
    pool.end();
    process.exit(1);
  }
}

// Run the migration
hashExistingPasswords();