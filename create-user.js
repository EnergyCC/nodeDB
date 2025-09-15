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

// Function to create a new user with a hashed password
async function createUser(username, password) {
  try {
    console.log(`Creating user ${username} with hashed password...`);
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Insert the user record
    await new Promise((resolve, reject) => {
      pool.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
    
    console.log(`Successfully created user ${username}`);
    pool.end();
  } catch (error) {
    console.error('Error creating user:', error);
    pool.end();
    process.exit(1);
  }
}

// Check if username and password were provided as command line arguments
if (process.argv.length < 4) {
  console.log('Usage: node create-user.js <username> <password>');
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

// Run the user creation
createUser(username, password);