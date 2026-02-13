-- ============================================
-- UNITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    bedrooms DECIMAL(3,1) DEFAULT 1,
    bathrooms DECIMAL(3,1) DEFAULT 1,
    square_feet INTEGER,
    floor_number INTEGER,
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance')),
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, unit_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_rent ON units(monthly_rent);

-- Comments for documentation
COMMENT ON TABLE units IS 'Stores individual apartment units within properties';
COMMENT ON COLUMN units.status IS 'Unit occupancy status: vacant, occupied, or maintenance';
COMMENT ON COLUMN units.monthly_rent IS 'Current monthly rent amount for this unit';
COMMENT ON CONSTRAINT units_property_id_unit_number_key ON units IS 'Ensures unique unit numbers within each property';
