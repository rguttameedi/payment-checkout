const { DataTypes } = require('sequelize');
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // Must be 32 bytes
const ALGORITHM = 'aes-256-gcm';

/**
 * User Identity Verification Model
 * Stores encrypted SSN and Government ID for high-value transactions
 */
module.exports = (sequelize) => {
  const UserIdentityVerification = sequelize.define('UserIdentityVerification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Encrypted SSN
    ssn_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Encrypted Government ID
    govt_id_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Last 4 digits of SSN (for display/verification)
    ssn_last_four: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    // Government ID type (passport, driver_license, national_id)
    govt_id_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    // When verification was completed
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    // IP address from which verification was submitted
    submitted_from_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    // Verification status
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'user_identity_verifications',
    timestamps: true,
    underscored: true
  });

  /**
   * Encrypt sensitive data
   */
  UserIdentityVerification.encrypt = function(text) {
    if (!text) return null;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV + AuthTag + Encrypted data (all hex encoded)
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  };

  /**
   * Decrypt sensitive data
   */
  UserIdentityVerification.decrypt = function(encryptedText) {
    if (!encryptedText) return null;

    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('❌ Decryption failed:', error.message);
      return null;
    }
  };

  /**
   * Get last 4 digits of SSN
   */
  UserIdentityVerification.getLastFour = function(ssn) {
    if (!ssn || ssn.length < 4) return null;
    return ssn.slice(-4);
  };

  /**
   * Instance method to decrypt SSN
   */
  UserIdentityVerification.prototype.getDecryptedSSN = function() {
    return UserIdentityVerification.decrypt(this.ssn_encrypted);
  };

  /**
   * Instance method to decrypt Government ID
   */
  UserIdentityVerification.prototype.getDecryptedGovtId = function() {
    return UserIdentityVerification.decrypt(this.govt_id_encrypted);
  };

  return UserIdentityVerification;
};
