-- ============================================
-- PAYMENT_METHODS TABLE (Tokenized - PCI Compliant)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('card', 'ach')),
    nickname VARCHAR(100),

    -- Card fields (masked - NEVER store full card number)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    card_expiry_month VARCHAR(2),
    card_expiry_year VARCHAR(4),

    -- ACH fields (masked - NEVER store full account number)
    account_last_four VARCHAR(4),
    account_type VARCHAR(20) CHECK (account_type IN ('checking', 'savings', NULL)),
    bank_name VARCHAR(100),

    -- Cybersource token (primary storage for actual payment processing)
    cybersource_token VARCHAR(255) NOT NULL,

    -- Billing address
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    billing_zip_code VARCHAR(10),
    billing_country VARCHAR(50) DEFAULT 'US',

    -- Status tracking
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deleted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON payment_methods(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);

-- Comments for documentation
COMMENT ON TABLE payment_methods IS 'Stores tokenized payment methods (PCI compliant - no raw card/account numbers)';
COMMENT ON COLUMN payment_methods.cybersource_token IS 'Cybersource payment token - used for actual payment processing';
COMMENT ON COLUMN payment_methods.card_last_four IS 'Last 4 digits of card (for display only)';
COMMENT ON COLUMN payment_methods.account_last_four IS 'Last 4 digits of bank account (for display only)';
COMMENT ON COLUMN payment_methods.is_default IS 'Primary payment method for this user';
