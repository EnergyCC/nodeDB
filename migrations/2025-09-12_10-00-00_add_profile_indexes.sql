-- Migration: add_profile_indexes
-- Created at: 2025-09-12T10:00:00.000Z

-- Add indexes on frequently searched columns in the profile table

-- Up migration
-- Check if indexes exist before creating them
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'profile' 
                      AND INDEX_NAME = 'idx_nume_client');

SET @sql = IF(@index_exists = 0, 
              'CREATE INDEX idx_nume_client ON profile (nume_client)', 
              'SELECT ''Index idx_nume_client already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'profile' 
                      AND INDEX_NAME = 'idx_nr_inmatriculare');

SET @sql = IF(@index_exists = 0, 
              'CREATE INDEX idx_nr_inmatriculare ON profile (nr_inmatriculare)', 
              'SELECT ''Index idx_nr_inmatriculare already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'profile' 
                      AND INDEX_NAME = 'idx_tip_auto');

SET @sql = IF(@index_exists = 0, 
              'CREATE INDEX idx_tip_auto ON profile (tip_auto)', 
              'SELECT ''Index idx_tip_auto already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Down migration
-- DROP INDEX idx_nume_client ON profile;
-- DROP INDEX idx_nr_inmatriculare ON profile;
-- DROP INDEX idx_tip_auto ON profile;