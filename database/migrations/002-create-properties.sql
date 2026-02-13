-- ============================================
-- PROPERTIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    property_manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_units INTEGER DEFAULT 0,
    property_type VARCHAR(50) CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_manager ON properties(property_manager_id);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);

-- Comments for documentation
COMMENT ON TABLE properties IS 'Stores property/building information';
COMMENT ON COLUMN properties.property_manager_id IS 'Reference to user with property_manager role';
COMMENT ON COLUMN properties.total_units IS 'Total number of units in this property';
