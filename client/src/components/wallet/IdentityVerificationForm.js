import React, { useState } from 'react';
import axios from 'axios';
import './IdentityVerificationForm.css';

/**
 * Identity Verification Form
 *
 * Collects SSN and Government ID for high-value transactions (>$3000 in 24hrs)
 * Data is encrypted before storage for compliance
 */
function IdentityVerificationForm({ onComplete, onCancel }) {
  const [ssn, setSsn] = useState('');
  const [govtId, setGovtId] = useState('');
  const [govtIdType, setGovtIdType] = useState('driver_license');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Format SSN as user types (XXX-XX-XXXX)
   */
  const handleSsnChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    // Format as XXX-XX-XXXX
    if (value.length > 5) {
      value = `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5)}`;
    } else if (value.length > 3) {
      value = `${value.substring(0, 3)}-${value.substring(3)}`;
    }

    setSsn(value);
  };

  /**
   * Submit identity verification
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate SSN format
    const ssnDigits = ssn.replace(/\D/g, '');
    if (ssnDigits.length !== 9) {
      setError('Please enter a valid 9-digit SSN');
      setLoading(false);
      return;
    }

    // Validate Government ID
    if (!govtId || govtId.trim().length < 5) {
      setError('Please enter a valid Government ID');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        '/api/identity-verification/save',
        {
          ssn: ssnDigits, // Send without dashes
          govtId: govtId.trim(),
          govtIdType
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Identity verification saved successfully');
        onComplete(response.data);
      }

    } catch (err) {
      console.error('❌ Error saving verification:', err);
      setError(err.response?.data?.error || 'Failed to save identity verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-verification-container">
      <div className="verification-card">
        {/* Header */}
        <div className="verification-header">
          <div className="header-icon">🔒</div>
          <h2>Identity Verification Required</h2>
          <p className="subtitle">
            For transactions over $3,000 within 24 hours, we need to verify your identity
            to comply with federal regulations.
          </p>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="notice-item">
            <span className="icon">🔐</span>
            <span>Bank-level encryption (AES-256)</span>
          </div>
          <div className="notice-item">
            <span className="icon">✓</span>
            <span>One-time verification only</span>
          </div>
          <div className="notice-item">
            <span className="icon">🛡️</span>
            <span>Federally compliant</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="verification-form">
          {/* SSN Field */}
          <div className="form-group">
            <label htmlFor="ssn">
              Social Security Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ssn"
              className="form-input"
              placeholder="XXX-XX-XXXX"
              value={ssn}
              onChange={handleSsnChange}
              required
              autoComplete="off"
              maxLength={11}
            />
            <small className="help-text">Format: 123-45-6789</small>
          </div>

          {/* Government ID Type */}
          <div className="form-group">
            <label htmlFor="govtIdType">
              ID Type <span className="required">*</span>
            </label>
            <select
              id="govtIdType"
              className="form-select"
              value={govtIdType}
              onChange={(e) => setGovtIdType(e.target.value)}
              required
            >
              <option value="driver_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID Card</option>
              <option value="state_id">State ID</option>
            </select>
          </div>

          {/* Government ID Number */}
          <div className="form-group">
            <label htmlFor="govtId">
              {govtIdType === 'driver_license' && "Driver's License Number"}
              {govtIdType === 'passport' && "Passport Number"}
              {govtIdType === 'national_id' && "National ID Number"}
              {govtIdType === 'state_id' && "State ID Number"}
              <span className="required"> *</span>
            </label>
            <input
              type="text"
              id="govtId"
              className="form-input"
              placeholder={`Enter your ${govtIdType.replace('_', ' ')} number`}
              value={govtId}
              onChange={(e) => setGovtId(e.target.value)}
              required
              minLength={5}
              autoComplete="off"
            />
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <p>
              <strong>Privacy Policy:</strong> Your information is encrypted and securely stored.
              We only use this data for identity verification and regulatory compliance.
              You will only need to provide this information once.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="btn-icon">✓</span>
                  Verify Identity
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel Payment
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="verification-footer">
          <p className="footer-note">
            <strong>Note:</strong> This verification is required by federal law for
            high-value transactions to prevent fraud and money laundering.
          </p>
        </div>
      </div>
    </div>
  );
}

export default IdentityVerificationForm;
