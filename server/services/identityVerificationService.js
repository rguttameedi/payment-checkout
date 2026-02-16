const models = require('../models');
const { Op } = require('sequelize');

class IdentityVerificationService {
  /**
   * Check if user needs identity verification for this payment
   *
   * @param {number} userId
   * @param {number} paymentAmount
   * @returns {Promise<{required: boolean, reason: string, hasExisting: boolean}>}
   */
  static async checkVerificationRequired(userId, paymentAmount) {
    try {
      // Check if user already has verified identity data
      const existingVerification = await models.UserIdentityVerification.findOne({
        where: {
          user_id: userId,
          status: 'verified'
        }
      });

      if (existingVerification) {
        // User already verified - no need to collect again
        return {
          required: false,
          reason: 'already_verified',
          hasExisting: true
        };
      }

      // Check payment amount in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentPayments = await models.Payment.sum('amount', {
        where: {
          tenant_id: userId,
          created_at: {
            [Op.gte]: twentyFourHoursAgo
          },
          payment_status: {
            [Op.in]: ['completed', 'pending']
          }
        }
      });

      const totalAmount = (recentPayments || 0) + paymentAmount;

      console.log(`💰 User ${userId} - Recent 24h payments: $${recentPayments}, Current: $${paymentAmount}, Total: $${totalAmount}`);

      if (totalAmount > 3000) {
        return {
          required: true,
          reason: 'high_value_transaction',
          hasExisting: false,
          totalAmount,
          threshold: 3000
        };
      }

      return {
        required: false,
        reason: 'below_threshold',
        hasExisting: false
      };

    } catch (error) {
      console.error('❌ Error checking verification requirement:', error);
      throw error;
    }
  }

  /**
   * Save encrypted identity verification data
   *
   * @param {number} userId
   * @param {string} ssn
   * @param {string} govtId
   * @param {string} govtIdType
   * @param {string} ipAddress
   */
  static async saveVerification(userId, ssn, govtId, govtIdType, ipAddress) {
    try {
      // Encrypt the sensitive data
      const ssnEncrypted = models.UserIdentityVerification.encrypt(ssn);
      const govtIdEncrypted = models.UserIdentityVerification.encrypt(govtId);
      const ssnLastFour = models.UserIdentityVerification.getLastFour(ssn);

      // Check if record exists
      let verification = await models.UserIdentityVerification.findOne({
        where: { user_id: userId }
      });

      if (verification) {
        // Update existing
        await verification.update({
          ssn_encrypted: ssnEncrypted,
          govt_id_encrypted: govtIdEncrypted,
          ssn_last_four: ssnLastFour,
          govt_id_type: govtIdType,
          verified_at: new Date(),
          submitted_from_ip: ipAddress,
          status: 'verified'
        });
      } else {
        // Create new
        verification = await models.UserIdentityVerification.create({
          user_id: userId,
          ssn_encrypted: ssnEncrypted,
          govt_id_encrypted: govtIdEncrypted,
          ssn_last_four: ssnLastFour,
          govt_id_type: govtIdType,
          verified_at: new Date(),
          submitted_from_ip: ipAddress,
          status: 'verified'
        });
      }

      console.log(`✅ Identity verification saved for user ${userId} (SSN: ***-**-${ssnLastFour})`);

      return {
        success: true,
        message: 'Identity verification saved successfully',
        last_four: ssnLastFour
      };

    } catch (error) {
      console.error('❌ Error saving verification:', error);
      throw error;
    }
  }

  /**
   * Get user's verification status
   */
  static async getVerificationStatus(userId) {
    try {
      const verification = await models.UserIdentityVerification.findOne({
        where: { user_id: userId },
        attributes: ['id', 'ssn_last_four', 'govt_id_type', 'verified_at', 'status']
      });

      if (!verification) {
        return {
          hasVerification: false,
          status: null
        };
      }

      return {
        hasVerification: true,
        status: verification.status,
        ssnLastFour: verification.ssn_last_four,
        govtIdType: verification.govt_id_type,
        verifiedAt: verification.verified_at
      };

    } catch (error) {
      console.error('❌ Error getting verification status:', error);
      throw error;
    }
  }
}

module.exports = IdentityVerificationService;
