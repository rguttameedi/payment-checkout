-- Split Payment Plans table
CREATE TABLE IF NOT EXISTS split_payment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  lease_id INTEGER NOT NULL,
  payment_method_id INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  number_of_splits INTEGER NOT NULL CHECK (number_of_splits BETWEEN 2 AND 4),
  amount_per_split DECIMAL(10, 2) NOT NULL,
  payment_month INTEGER NOT NULL,
  payment_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES users(id),
  FOREIGN KEY (lease_id) REFERENCES leases(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

-- Split Payment Installments table
CREATE TABLE IF NOT EXISTS split_payment_installments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  split_plan_id INTEGER NOT NULL,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  scheduled_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  payment_id INTEGER, -- Reference to rent_payments table
  processed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (split_plan_id) REFERENCES split_payment_plans(id),
  FOREIGN KEY (payment_id) REFERENCES rent_payments(id)
);

-- Indexes
CREATE INDEX idx_split_plans_tenant ON split_payment_plans(tenant_id);
CREATE INDEX idx_split_plans_active ON split_payment_plans(is_active);
CREATE INDEX idx_split_plans_month_year ON split_payment_plans(payment_month, payment_year);
CREATE INDEX idx_split_installments_plan ON split_payment_installments(split_plan_id);
CREATE INDEX idx_split_installments_status ON split_payment_installments(status);
CREATE INDEX idx_split_installments_scheduled_date ON split_payment_installments(scheduled_date);
