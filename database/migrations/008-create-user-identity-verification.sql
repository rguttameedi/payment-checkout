-- Create user_identity_verifications table
-- Stores encrypted SSN and Government ID for high-value transaction compliance

CREATE TABLE IF NOT EXISTS user_identity_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ssn_encrypted TEXT NOT NULL,
  govt_id_encrypted TEXT NOT NULL,
  ssn_last_four VARCHAR(4) NOT NULL,
  govt_id_type VARCHAR(50) NOT NULL,
  verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_from_ip VARCHAR(45),
  status VARCHAR(20) NOT NULL DEFAULT 'verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one verification record per user
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_identity_verifications_user_id
  ON user_identity_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_user_identity_verifications_status
  ON user_identity_verifications(status);

-- Add comment to table
COMMENT ON TABLE user_identity_verifications IS
  'Stores encrypted identity verification data (SSN, Government ID) for users making high-value transactions (>$3000 in 24 hours). Data is encrypted using AES-256-GCM for PCI compliance.';

COMMENT ON COLUMN user_identity_verifications.ssn_encrypted IS
  'AES-256-GCM encrypted SSN in format: iv:authTag:encrypted';

COMMENT ON COLUMN user_identity_verifications.govt_id_encrypted IS
  'AES-256-GCM encrypted Government ID in format: iv:authTag:encrypted';

COMMENT ON COLUMN user_identity_verifications.ssn_last_four IS
  'Last 4 digits of SSN for display purposes (unencrypted)';
