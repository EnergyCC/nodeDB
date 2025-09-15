-- Migration: add_profile_indexes
-- Created at: 2025-09-12T10:00:00.000Z

-- Add indexes on frequently searched columns in the profile table

-- Up migration
CREATE INDEX IF NOT EXISTS idx_nume_client ON profile (nume_client);
CREATE INDEX IF NOT EXISTS idx_nr_inmatriculare ON profile (nr_inmatriculare);
CREATE INDEX IF NOT EXISTS idx_tip_auto ON profile (tip_auto);

-- Down migration
-- DROP INDEX idx_nume_client ON profile;
-- DROP INDEX idx_nr_inmatriculare ON profile;
-- DROP INDEX idx_tip_auto ON profile;