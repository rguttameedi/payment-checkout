-- ============================================
-- RECURRING_PAYMENT_SCHEDULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS recurring_payment_schedules (
    id SERIAL PRIMARY KEY,
    lease_id INTEGER NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,

    -- Schedule configuration
    is_active BOOLEAN DEFAULT true,
    schedule_type VARCHAR(20) DEFAULT 'monthly' CHECK (schedule_type IN ('monthly', 'custom')),
    payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,

    -- Payment defaults
    default_amount DECIMAL(10,2) NOT NULL,

    -- Tracking
    next_payment_date DATE NOT NULL,
    last_payment_date DATE,
    total_payments_made INTEGER DEFAULT 0,
    failed_payment_attempts INTEGER DEFAULT 0,

    -- Notifications
    send_reminder_email BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 3,
    send_receipt_email BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure only one active schedule per lease
    UNIQUE(lease_id, is_active)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_tenant ON recurring_payment_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_lease ON recurring_payment_schedules(lease_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_next_payment ON recurring_payment_schedules(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_active ON recurring_payment_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_due_today ON recurring_payment_schedules(is_active, next_payment_date);

-- Comments for documentation
COMMENT ON TABLE recurring_payment_schedules IS 'Stores auto-pay schedules for automated monthly rent collection';
COMMENT ON COLUMN recurring_payment_schedules.payment_day IS 'Day of month to charge rent (1-31)';
COMMENT ON COLUMN recurring_payment_schedules.next_payment_date IS 'Next scheduled payment date (processed by cron job)';
COMMENT ON COLUMN recurring_payment_schedules.failed_payment_attempts IS 'Consecutive failures (auto-disables after 3)';
COMMENT ON COLUMN recurring_payment_schedules.reminder_days_before IS 'Send reminder email N days before payment';
COMMENT ON CONSTRAINT recurring_payment_schedules_lease_id_is_active_key ON recurring_payment_schedules IS 'Only one active schedule allowed per lease';
