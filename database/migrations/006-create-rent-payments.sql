-- ============================================
-- RENT_PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rent_payments (
    id SERIAL PRIMARY KEY,
    lease_id INTEGER NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,

    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('card', 'ach')),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'completed', 'failed', 'refunded', 'cancelled')),

    -- Cybersource integration
    cybersource_transaction_id VARCHAR(255) UNIQUE,
    cybersource_reference_code VARCHAR(255),

    -- Payment period tracking
    payment_month INTEGER NOT NULL CHECK (payment_month BETWEEN 1 AND 12),
    payment_year INTEGER NOT NULL,
    rent_due_date DATE NOT NULL,
    payment_date TIMESTAMP,

    -- Fees & charges
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,

    -- Payment method info (stored for history - even if payment method deleted)
    masked_payment_info VARCHAR(255),

    -- Recurring payment tracking
    is_recurring BOOLEAN DEFAULT false,
    recurring_schedule_id INTEGER,

    -- Metadata
    notes TEXT,
    receipt_url VARCHAR(500),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rent_payments_lease ON rent_payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant ON rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON rent_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_rent_payments_transaction ON rent_payments(cybersource_transaction_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_period ON rent_payments(payment_year, payment_month);
CREATE INDEX IF NOT EXISTS idx_rent_payments_due_date ON rent_payments(rent_due_date);
CREATE INDEX IF NOT EXISTS idx_rent_payments_recurring ON rent_payments(is_recurring, recurring_schedule_id);

-- Comments for documentation
COMMENT ON TABLE rent_payments IS 'Stores all rent payment transactions';
COMMENT ON COLUMN rent_payments.cybersource_transaction_id IS 'Unique transaction ID from Cybersource payment gateway';
COMMENT ON COLUMN rent_payments.payment_status IS 'Payment lifecycle: pending → authorized → captured → completed';
COMMENT ON COLUMN rent_payments.masked_payment_info IS 'Display info like "Card ending in 1234" (safe to show)';
COMMENT ON COLUMN rent_payments.is_recurring IS 'True if payment was auto-processed by recurring schedule';
COMMENT ON COLUMN rent_payments.total_amount IS 'Total charged = amount + late_fee + processing_fee';
