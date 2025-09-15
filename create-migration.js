const fs = require('fs').promises;
const path = require('path');

/**
 * Create a new migration file
 */
async function createMigration(name) {
  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(__dirname, 'migrations');
  await fs.mkdir(migrationsDir, { recursive: true });
  
  // Generate timestamp for migration filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
  const filename = `${timestamp}_${name}.sql`;
  const filePath = path.join(migrationsDir, filename);
  
  // Create migration template
  const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Add your migration SQL here
-- Example:
-- ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255);
-- CREATE INDEX idx_name ON table_name (column_name);

-- Up migration
-- Your SQL code here

-- Down migration (uncomment to enable rollback)
-- Your rollback SQL code here
`;
  
  // Write the migration file
  await fs.writeFile(filePath, template);
  
  console.log(`Created migration file: ${filePath}`);
  console.log('Edit this file to add your migration SQL.');
}

// Check if migration name was provided
if (process.argv.length < 3) {
  console.log('Usage: node create-migration.js <migration-name>');
  console.log('Example: node create-migration.js add_user_email_column');
  process.exit(1);
}

const migrationName = process.argv[2];
createMigration(migrationName);