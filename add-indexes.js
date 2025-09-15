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

// Function to add indexes to existing profile table
async function addProfileIndexes() {
  try {
    // Check if indexes already exist
    const indexes = await new Promise((resolve, reject) => {
      pool.query('SHOW INDEX FROM profile', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const existingIndexes = indexes.map(index => index.Key_name);
    
    // Define indexes to add
    const indexesToAdd = [
      { name: 'idx_nume_client', column: 'nume_client' },
      { name: 'idx_nr_inmatriculare', column: 'nr_inmatriculare' },
      { name: 'idx_tip_auto', column: 'tip_auto' }
    ];

    console.log('Checking existing indexes:', existingIndexes);
    
    // Add missing indexes
    for (const index of indexesToAdd) {
      if (!existingIndexes.includes(index.name)) {
        console.log(`Adding index ${index.name} on column ${index.column}...`);
        
        await new Promise((resolve, reject) => {
          const sql = `CREATE INDEX ${index.name} ON profile (${index.column})`;
          pool.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        
        console.log(`Successfully added index ${index.name}`);
      } else {
        console.log(`Index ${index.name} already exists, skipping...`);
      }
    }
    
    console.log('All indexes have been processed');
    pool.end();
  } catch (error) {
    console.error('Error adding indexes:', error);
    pool.end();
    process.exit(1);
  }
}

// Run the migration
addProfileIndexes();