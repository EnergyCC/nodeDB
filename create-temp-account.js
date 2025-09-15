const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to database
connection.connect(async (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }

  console.log('Connected to database');

  // Get username and password from command line arguments
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('Usage: node create-temp-account.js <username> <password>');
    connection.end();
    process.exit(1);
  }

  try {
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error creating user:', err);
        connection.end();
        process.exit(1);
      }

      console.log(`User ${username} created successfully with ID: ${results.insertId}`);
      connection.end();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    connection.end();
    process.exit(1);
  }
});