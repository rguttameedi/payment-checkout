-- Roommate Split Plans table
CREATE TABLE IF NOT EXISTS roommate_split_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_month INTEGER NOT NULL,
  payment_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Roommate Shares table
CREATE TABLE IF NOT EXISTS roommate_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  split_plan_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_email VARCHAR(255),
  share_amount DECIMAL(10, 2) NOT NULL,
  share_percentage DECIMAL(5, 2),
  payment_method_id INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
  payment_id INTEGER, -- Reference to rent_payments
  paid_at TIMESTAMP,
  reminder_sent BOOLEAN DEFAULT 0,
  last_reminder_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (split_plan_id) REFERENCES roommate_split_plans(id),
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (payment_id) REFERENCES rent_payments(id)
);

-- Indexes
CREATE INDEX idx_roommate_splits_lease ON roommate_split_plans(lease_id);
CREATE INDEX idx_roommate_splits_active ON roommate_split_plans(is_active);
CREATE INDEX idx_roommate_shares_plan ON roommate_shares(split_plan_id);
CREATE INDEX idx_roommate_shares_tenant ON roommate_shares(tenant_id);
CREATE INDEX idx_roommate_shares_status ON roommate_shares(status);
