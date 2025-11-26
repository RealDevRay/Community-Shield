-- Community Shield Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. INCIDENTS TABLE
-- ============================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    summary TEXT,
    raw_text TEXT,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Dispatched', 'Resolved', 'Cancelled')),
    assigned_unit_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. UNITS TABLE
-- ============================================
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) DEFAULT 'Patrol',
    status VARCHAR(50) DEFAULT 'Idle' CHECK (status IN ('Idle', 'Patrolling', 'Responding', 'On Scene')),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    current_incident_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. LOGS TABLE
-- ============================================
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    log_type VARCHAR(50) DEFAULT 'info' CHECK (log_type IN ('info', 'incident', 'dispatch', 'analysis', 'bias', 'error')),
    incident_id UUID,
    unit_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. HOTSPOTS TABLE
-- ============================================
CREATE TABLE hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    risk_score DECIMAL(3, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    incident_count INTEGER DEFAULT 0,
    last_incident_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. BIAS_CHECKS TABLE
-- ============================================
CREATE TABLE bias_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    method VARCHAR(50) NOT NULL,
    bias_score DECIMAL(3, 2) NOT NULL CHECK (bias_score >= 0 AND bias_score <= 1),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Clear', 'Flagged')),
    warnings TEXT[],
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_type ON logs(log_type);
CREATE INDEX idx_hotspots_risk_score ON hotspots(risk_score DESC);
CREATE INDEX idx_bias_checks_incident_id ON bias_checks(incident_id);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================
ALTER TABLE incidents ADD CONSTRAINT fk_incidents_unit 
    FOREIGN KEY (assigned_unit_id) REFERENCES units(id) ON DELETE SET NULL;

ALTER TABLE units ADD CONSTRAINT fk_units_incident 
    FOREIGN KEY (current_incident_id) REFERENCES incidents(id) ON DELETE SET NULL;

ALTER TABLE logs ADD CONSTRAINT fk_logs_incident 
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;

ALTER TABLE logs ADD CONSTRAINT fk_logs_unit 
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

ALTER TABLE bias_checks ADD CONSTRAINT fk_bias_checks_incident 
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE;

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON hotspots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_checks ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for MVP (you can restrict this later with auth)
CREATE POLICY "Allow public read access" ON incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON incidents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON incidents FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON units FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON units FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON hotspots FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON hotspots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON hotspots FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON bias_checks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON bias_checks FOR INSERT WITH CHECK (true);

-- ============================================
-- SEED DATA (Initial Units)
-- ============================================
INSERT INTO units (name, type, status, lat, lng) VALUES
    ('Alpha', 'Patrol', 'Idle', -1.2921, 36.8219),
    ('Bravo', 'Patrol', 'Idle', -1.2500, 36.8000),
    ('Charlie', 'Rapid Response', 'Idle', -1.3000, 36.7800);

-- ============================================
-- ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================
-- This allows the frontend to listen for changes
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE units;
ALTER PUBLICATION supabase_realtime ADD TABLE logs;
