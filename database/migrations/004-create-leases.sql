-- ============================================
-- LEASES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leases (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day BETWEEN 1 AND 31),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    payment_grace_period_days INTEGER DEFAULT 5,
    late_fee_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(unit_id, tenant_id, lease_start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_unit ON leases(unit_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_leases_dates ON leases(lease_start_date, lease_end_date);
CREATE INDEX IF NOT EXISTS idx_leases_active ON leases(status, lease_end_date);

-- Comments for documentation
COMMENT ON TABLE leases IS 'Stores lease agreements between tenants and units';
COMMENT ON COLUMN leases.rent_due_day IS 'Day of month when rent is due (1-31)';
COMMENT ON COLUMN leases.status IS 'Lease status: active (current), expired (ended), terminated (cancelled), pending (not started)';
COMMENT ON COLUMN leases.payment_grace_period_days IS 'Number of days after due date before late fee applies';
