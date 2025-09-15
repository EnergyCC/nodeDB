-- Migration: add_session_secret_to_users
-- Created at: 2025-09-12T10:05:00.000Z

-- Add session_secret column to users table for enhanced security

-- Up migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_secret VARCHAR(64) NULL;

-- Down migration
-- ALTER TABLE users DROP COLUMN session_secret;