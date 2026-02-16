-- Add recurring_payment_schedules table
CREATE TABLE IF NOT EXISTS recurring_payment_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  payment_method_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  schedule_type VARCHAR(20) DEFAULT 'monthly', -- monthly, weekly, biweekly
  payment_day INTEGER NOT NULL, -- Day of month (1-31)
  start_date DATE NOT NULL,
  end_date DATE,
  default_amount DECIMAL(10, 2) NOT NULL,
  next_payment_date DATE NOT NULL,
  last_payment_date DATE,
  total_payments_made INTEGER DEFAULT 0,
  failed_payment_attempts INTEGER DEFAULT 0,
  send_reminder_email BOOLEAN DEFAULT 1,
  reminder_days_before INTEGER DEFAULT 3,
  send_receipt_email BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(id),
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- Add indexes for performance
CREATE INDEX idx_recurring_schedules_tenant ON recurring_payment_schedules(tenant_id);
CREATE INDEX idx_recurring_schedules_active ON recurring_payment_schedules(is_active);
CREATE INDEX idx_recurring_schedules_next_payment ON recurring_payment_schedules(next_payment_date);
