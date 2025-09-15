const mysql = require('mysql');
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

// Function to create migrations table
async function createMigrationsTable() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        batch INT NOT NULL,
        migration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name)
      )
    `;
    
    await new Promise((resolve, reject) => {
      pool.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Migrations table created successfully');
    pool.end();
  } catch (error) {
    console.error('Error creating migrations table:', error);
    pool.end();
    process.exit(1);
  }
}

// Run the function
createMigrationsTable();