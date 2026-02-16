-- ============================================
-- Migration: Add Flexible Payment Plans Feature
-- Description: Adds support for weekly and biweekly payment schedules
-- ============================================

-- Create flexible_payment_plans table
CREATE TABLE IF NOT EXISTS flexible_payment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  payment_method_id INTEGER NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK(frequency IN ('weekly', 'biweekly')),
  payment_amount DECIMAL(10, 2) NOT NULL,
  total_monthly_amount DECIMAL(10, 2) NOT NULL,
  start_date DATETIME NOT NULL,
  next_payment_date DATETIME NOT NULL,
  payment_day_of_week INTEGER,
  is_active BOOLEAN DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'paused', 'cancelled', 'completed')),
  auto_pay_enabled BOOLEAN DEFAULT 1,
  send_reminder_email BOOLEAN DEFAULT 1,
  reminder_days_before INTEGER DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT
);

-- Create flexible_payment_schedules table
CREATE TABLE IF NOT EXISTS flexible_payment_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  scheduled_date DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'processing', 'completed', 'failed', 'skipped', 'cancelled')),
  payment_transaction_id INTEGER,
  processed_at DATETIME,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  reminder_sent BOOLEAN DEFAULT 0,
  reminder_sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES flexible_payment_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_transaction_id) REFERENCES rent_payments(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flexible_plans_tenant ON flexible_payment_plans(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_flexible_plans_status ON flexible_payment_plans(status, is_active);
CREATE INDEX IF NOT EXISTS idx_flexible_plans_next_payment ON flexible_payment_plans(next_payment_date, is_active);

CREATE INDEX IF NOT EXISTS idx_flexible_schedules_plan ON flexible_payment_schedules(plan_id, status);
CREATE INDEX IF NOT EXISTS idx_flexible_schedules_date ON flexible_payment_schedules(scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_flexible_schedules_status ON flexible_payment_schedules(status);

-- Success message
SELECT '✅ Flexible Payment Plans tables created successfully' AS result;
