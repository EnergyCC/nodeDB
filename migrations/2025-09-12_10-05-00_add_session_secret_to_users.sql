-- Migration: add_session_secret_to_users
-- Created at: 2025-09-12T10:05:00.000Z

-- Add session_secret column to users table for enhanced security

-- Up migration
-- Check if column exists before adding it
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'users' 
                      AND COLUMN_NAME = 'session_secret');

SET @sql = IF(@column_exists = 0, 
              'ALTER TABLE users ADD COLUMN session_secret VARCHAR(64) NULL', 
              'SELECT ''Column session_secret already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Down migration
-- ALTER TABLE users DROP COLUMN session_secret;