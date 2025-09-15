const mysql = require('mysql');
const fs = require('fs').promises;
const path = require('path');
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

/**
 * Get the current batch number
 */
async function getCurrentBatch() {
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query('SELECT MAX(batch) as max_batch FROM migrations', (err, results) => {
        if (err) reject(err);
        else resolve(results[0].max_batch || 0);
      });
    });
    return result;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if a migration has already been run
 */
async function hasMigrationRun(name) {
  try {
    const result = await new Promise((resolve, reject) => {
      pool.query('SELECT id FROM migrations WHERE name = ?', [name], (err, results) => {
        if (err) reject(err);
        else resolve(results.length > 0);
      });
    });
    return result;
  } catch (error) {
    return false;
  }
}

/**
 * Record a migration as having been run
 */
async function recordMigration(name, batch) {
  await new Promise((resolve, reject) => {
    pool.query('INSERT INTO migrations (name, batch) VALUES (?, ?)', [name, batch], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

/**
 * Run a migration file
 */
async function runMigration(filePath, batch) {
  const migrationName = path.basename(filePath);
  
  // Check if migration has already been run
  if (await hasMigrationRun(migrationName)) {
    console.log(`Migration ${migrationName} has already been run, skipping...`);
    return;
  }
  
  console.log(`Running migration: ${migrationName}`);
  
  // Read the migration file
  const migrationContent = await fs.readFile(filePath, 'utf8');
  
  // Execute the migration
  await new Promise((resolve, reject) => {
    pool.query(migrationContent, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
  
  // Record the migration
  await recordMigration(migrationName, batch);
  console.log(`Successfully completed migration: ${migrationName}`);
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  try {
    // Get the current batch number
    const currentBatch = await getCurrentBatch();
    const nextBatch = currentBatch + 1;
    
    console.log(`Running migrations for batch ${nextBatch}`);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    let files;
    
    try {
      files = await fs.readdir(migrationsDir);
    } catch (error) {
      console.log('No migrations directory found, creating one...');
      await fs.mkdir(migrationsDir, { recursive: true });
      files = [];
    }
    
    // Sort files by name to ensure they run in order
    files.sort();
    
    // Run each migration
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        await runMigration(filePath, nextBatch);
      }
    }
    
    console.log('All migrations completed successfully');
    pool.end();
  } catch (error) {
    console.error('Error running migrations:', error);
    pool.end();
    process.exit(1);
  }
}

// Run the migrations
runMigrations();