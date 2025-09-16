-- Migration: fix_foreign_key_constraint
-- Created at: 2025-09-12T10:10:00.000Z

-- Fix the foreign key constraint on jobs table to prevent CASCADE deletion
-- This ensures that when a profile is soft-deleted, associated jobs are not automatically deleted

-- Up migration
-- First drop the existing constraint if it exists
SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                         WHERE TABLE_SCHEMA = DATABASE() 
                         AND TABLE_NAME = 'jobs' 
                         AND REFERENCED_TABLE_NAME = 'profile' 
                         LIMIT 1);

SET @drop_sql = IF(@constraint_name IS NOT NULL, 
                   CONCAT('ALTER TABLE jobs DROP FOREIGN KEY ', @constraint_name), 
                   'SELECT ''No foreign key constraint to drop''');

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add the new constraint with SET NULL instead of CASCADE
ALTER TABLE jobs ADD CONSTRAINT jobs_ibfk_1 FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Down migration
-- SET @constraint_name = (SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
--                          WHERE TABLE_SCHEMA = DATABASE() 
--                          AND TABLE_NAME = 'jobs' 
--                          AND REFERENCED_TABLE_NAME = 'profile' 
--                          LIMIT 1);

-- SET @drop_sql = IF(@constraint_name IS NOT NULL, 
--                    CONCAT('ALTER TABLE jobs DROP FOREIGN KEY ', @constraint_name), 
--                    'SELECT ''No foreign key constraint to drop''');

-- PREPARE stmt FROM @drop_sql;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

-- ALTER TABLE jobs ADD CONSTRAINT jobs_ibfk_1 FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE ON UPDATE CASCADE;