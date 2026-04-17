-- ============================================================================
-- KISANCRED ENHANCED DATABASE SCHEMA
-- Based on data_parameters.md specification
-- ============================================================================

-- Drop existing tables if recreating (comment out if you want to preserve data)
-- DROP TABLE IF EXISTS ml_assessments CASCADE;
-- DROP TABLE IF EXISTS api_fetched_data CASCADE;
-- DROP TABLE IF EXISTS farmer_financial_data CASCADE;
-- DROP TABLE IF EXISTS farmers CASCADE;

-- ============================================================================
-- 0. FARMERS TABLE (Base table - create first if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  farm_name TEXT,
  farm_location TEXT,
  farm_size_acres NUMERIC(10, 2),
  crop_types TEXT[],
  years_farming INTEGER,
  government_id TEXT,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email);

-- Enable RLS on farmers table
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Farmers RLS Policies
DROP POLICY IF EXISTS "Users can view their own farmer profile" ON farmers;
CREATE POLICY "Users can view their own farmer profile"
  ON farmers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own farmer profile" ON farmers;
CREATE POLICY "Users can insert their own farmer profile"
  ON farmers FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own farmer profile" ON farmers;
CREATE POLICY "Users can update their own farmer profile"
  ON farmers FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- 1. FARMER FINANCIAL DATA TABLE
-- Stores all financial and agricultural data collected from frontend form
-- ============================================================================
CREATE TABLE IF NOT EXISTS farmer_financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  
  -- Identity & Contact (from form)
  aadhaar_number TEXT,
  
  -- Location & Timing
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('North', 'South', 'East', 'West')),
  farming_season TEXT NOT NULL CHECK (farming_season IN ('Kharif', 'Rabi', 'Zaid')),
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  
  -- Core Financial Fields (in ₹ thousands)
  enterprise_size TEXT NOT NULL CHECK (enterprise_size IN ('Small', 'Medium', 'Large')),
  annual_revenue NUMERIC(12, 2) NOT NULL CHECK (annual_revenue > 0),
  annual_expenses NUMERIC(12, 2) NOT NULL CHECK (annual_expenses >= 0),
  loan_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (loan_amount >= 0),
  
  -- Agricultural Fields
  landholding_size NUMERIC(10, 2) NOT NULL CHECK (landholding_size > 0),
  crop_type TEXT NOT NULL CHECK (crop_type IN ('Wheat', 'Rice', 'Cotton', 'Maize', 'Pulses', 'Vegetables', 'Groundnut')),
  irrigation_type TEXT NOT NULL CHECK (irrigation_type IN ('Rainfed', 'Canal', 'Borewell', 'Sprinkler', 'Drip')),
  land_ownership_status TEXT CHECK (land_ownership_status IN ('Owned', 'Leased')),
  
  -- Auto-Calculated Derived Fields
  net_profit NUMERIC(12, 2) GENERATED ALWAYS AS (annual_revenue - annual_expenses) STORED,
  debt_to_equity_ratio NUMERIC(10, 4) GENERATED ALWAYS AS (
    CASE 
      WHEN annual_revenue > 0 THEN loan_amount / (annual_revenue * 2)
      ELSE 0
    END
  ) STORED,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster farmer lookups
CREATE INDEX IF NOT EXISTS idx_farmer_financial_data_farmer_id ON farmer_financial_data(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_financial_data_region ON farmer_financial_data(region);
CREATE INDEX IF NOT EXISTS idx_farmer_financial_data_crop_type ON farmer_financial_data(crop_type);

-- ============================================================================
-- 2. API FETCHED DATA TABLE
-- Stores data automatically fetched from external APIs
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_fetched_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  financial_data_id UUID REFERENCES farmer_financial_data(id) ON DELETE CASCADE,
  
  -- IMD (India Meteorological Department) API Data
  average_temperature NUMERIC(5, 2), -- in °C
  rainfall NUMERIC(8, 2), -- in mm
  
  -- NDMA (National Disaster Management Authority) API Data
  drought_index NUMERIC(3, 2) CHECK (drought_index >= 0 AND drought_index <= 1), -- 0.0 to 1.0
  flood_risk NUMERIC(3, 2) CHECK (flood_risk >= 0 AND flood_risk <= 1), -- 0.0 to 1.0
  
  -- AGMARKNET API Data
  commodity_price_index NUMERIC(10, 2),
  
  -- Ministry of Agriculture API Data
  input_cost_index NUMERIC(10, 2),
  
  -- Government Policy Database
  policy_support_score INTEGER CHECK (policy_support_score >= 1 AND policy_support_score <= 4),
  
  -- Metadata
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  data_source_version TEXT, -- Track API version for debugging
  is_valid BOOLEAN DEFAULT TRUE, -- Flag for data validation
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_fetched_data_farmer_id ON api_fetched_data(farmer_id);
CREATE INDEX IF NOT EXISTS idx_api_fetched_data_financial_data_id ON api_fetched_data(financial_data_id);

-- ============================================================================
-- 3. ML ASSESSMENTS TABLE
-- Stores ML model predictions and credit score calculations
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  financial_data_id UUID REFERENCES farmer_financial_data(id) ON DELETE CASCADE,
  api_data_id UUID REFERENCES api_fetched_data(id) ON DELETE SET NULL,
  
  -- ML Model Output
  predicted_credit_score NUMERIC(5, 2) CHECK (predicted_credit_score >= 0 AND predicted_credit_score <= 100),
  risk_category TEXT CHECK (risk_category IN ('Low', 'Medium', 'High', 'Very High')),
  
  -- Component Scores (if provided by ML model)
  financial_stability_score NUMERIC(5, 2),
  climate_resilience_score NUMERIC(5, 2),
  market_risk_score NUMERIC(5, 2),
  repayment_capacity_score NUMERIC(5, 2),
  
  -- Advanced Engineered Features (from ML microservice)
  expense_to_revenue_ratio NUMERIC(10, 4),
  debt_sustainability_ratio NUMERIC(10, 4),
  net_profit_margin NUMERIC(10, 4),
  climate_resilience_index NUMERIC(10, 4),
  temperature_stress_indicator NUMERIC(10, 4),
  market_risk_indicator NUMERIC(10, 4),
  
  -- SHAP Explainability (stored as JSONB for flexibility)
  shap_values JSONB, -- Store SHAP values for explainability
  top_positive_factors JSONB, -- Top factors improving score
  top_negative_factors JSONB, -- Top factors reducing score
  
  -- Model Metadata
  model_version TEXT,
  model_confidence NUMERIC(5, 4), -- 0.0 to 1.0
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Recommendations
  improvement_suggestions JSONB,
  eligible_subsidies TEXT[], -- Array of subsidy IDs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ml_assessments_farmer_id ON ml_assessments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ml_assessments_financial_data_id ON ml_assessments(financial_data_id);
CREATE INDEX IF NOT EXISTS idx_ml_assessments_credit_score ON ml_assessments(predicted_credit_score);
CREATE INDEX IF NOT EXISTS idx_ml_assessments_risk_category ON ml_assessments(risk_category);

-- ============================================================================
-- 4. UPDATE EXISTING CREDIT_SCORES TABLE OR CREATE IF NOT EXISTS
-- Add reference to ML assessments for integration
-- ============================================================================

-- Create credit_scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  overall_score NUMERIC(5, 2),
  payment_history_score NUMERIC(5, 2),
  farm_productivity_score NUMERIC(5, 2),
  financial_stability_score NUMERIC(5, 2),
  market_engagement_score NUMERIC(5, 2),
  risk_level TEXT,
  credit_limit NUMERIC(12, 2),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  ml_assessment_id UUID REFERENCES ml_assessments(id) ON DELETE SET NULL
);

-- Add ml_assessment_id column if table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_scores' AND column_name = 'ml_assessment_id'
  ) THEN
    ALTER TABLE credit_scores 
    ADD COLUMN ml_assessment_id UUID REFERENCES ml_assessments(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_credit_scores_farmer_id ON credit_scores(farmer_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_ml_assessment_id ON credit_scores(ml_assessment_id);

-- Enable RLS on credit_scores
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view their own credit scores" ON credit_scores;
CREATE POLICY "Farmers can view their own credit scores"
  ON credit_scores FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4B. CREATE OTHER SUPPORTING TABLES IF NOT EXISTS
-- ============================================================================

-- Subsidies table
CREATE TABLE IF NOT EXISTS subsidies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subsidy_type TEXT,
  amount NUMERIC(12, 2),
  eligibility_criteria JSONB,
  min_credit_score NUMERIC(5, 2),
  max_credit_score NUMERIC(5, 2),
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subsidy Applications table
CREATE TABLE IF NOT EXISTS subsidy_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  subsidy_id UUID REFERENCES subsidies(id) ON DELETE CASCADE,
  application_status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  disbursed_at TIMESTAMPTZ,
  disbursed_amount NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  transaction_type TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  payment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm Activities table
CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  activity_type TEXT,
  crop_type TEXT,
  area_covered NUMERIC(10, 2),
  activity_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for supporting tables
CREATE INDEX IF NOT EXISTS idx_subsidy_applications_farmer_id ON subsidy_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_subsidy_applications_subsidy_id ON subsidy_applications(subsidy_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_farmer_id ON farm_activities(farmer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_farmer_id ON notifications(farmer_id);

-- Enable RLS on supporting tables
ALTER TABLE subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supporting tables
DROP POLICY IF EXISTS "Anyone can view active subsidies" ON subsidies;
CREATE POLICY "Anyone can view active subsidies"
  ON subsidies FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Farmers can view their own applications" ON subsidy_applications;
CREATE POLICY "Farmers can view their own applications"
  ON subsidy_applications FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can view their own transactions" ON transactions;
CREATE POLICY "Farmers can view their own transactions"
  ON transactions FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can view their own activities" ON farm_activities;
CREATE POLICY "Farmers can view their own activities"
  ON farm_activities FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can view their own notifications" ON notifications;
CREATE POLICY "Farmers can view their own notifications"
  ON notifications FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to farmer_financial_data
DROP TRIGGER IF EXISTS update_farmer_financial_data_updated_at ON farmer_financial_data;
CREATE TRIGGER update_farmer_financial_data_updated_at
  BEFORE UPDATE ON farmer_financial_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to api_fetched_data
DROP TRIGGER IF EXISTS update_api_fetched_data_updated_at ON api_fetched_data;
CREATE TRIGGER update_api_fetched_data_updated_at
  BEFORE UPDATE ON api_fetched_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to ml_assessments
DROP TRIGGER IF EXISTS update_ml_assessments_updated_at ON ml_assessments;
CREATE TRIGGER update_ml_assessments_updated_at
  BEFORE UPDATE ON ml_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE farmer_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_fetched_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_assessments ENABLE ROW LEVEL SECURITY;

-- Farmer Financial Data Policies
DROP POLICY IF EXISTS "Farmers can view their own financial data" ON farmer_financial_data;
CREATE POLICY "Farmers can view their own financial data"
  ON farmer_financial_data FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can insert their own financial data" ON farmer_financial_data;
CREATE POLICY "Farmers can insert their own financial data"
  ON farmer_financial_data FOR INSERT
  WITH CHECK (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Farmers can update their own financial data" ON farmer_financial_data;
CREATE POLICY "Farmers can update their own financial data"
  ON farmer_financial_data FOR UPDATE
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

-- API Fetched Data Policies
DROP POLICY IF EXISTS "Farmers can view their own API data" ON api_fetched_data;
CREATE POLICY "Farmers can view their own API data"
  ON api_fetched_data FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert API data" ON api_fetched_data;
CREATE POLICY "System can insert API data"
  ON api_fetched_data FOR INSERT
  WITH CHECK (true); -- Backend service will insert this

-- ML Assessments Policies
DROP POLICY IF EXISTS "Farmers can view their own ML assessments" ON ml_assessments;
CREATE POLICY "Farmers can view their own ML assessments"
  ON ml_assessments FOR SELECT
  USING (
    farmer_id IN (
      SELECT id FROM farmers WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert ML assessments" ON ml_assessments;
CREATE POLICY "System can insert ML assessments"
  ON ml_assessments FOR INSERT
  WITH CHECK (true); -- Backend ML service will insert this

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to get latest ML assessment for a farmer
CREATE OR REPLACE FUNCTION get_latest_ml_assessment(p_farmer_id UUID)
RETURNS TABLE (
  assessment_id UUID,
  credit_score NUMERIC,
  risk_category TEXT,
  assessment_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    predicted_credit_score,
    ml_assessments.risk_category,
    assessment_date
  FROM ml_assessments
  WHERE farmer_id = p_farmer_id
  ORDER BY assessment_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get farmer's complete profile with latest data
CREATE OR REPLACE FUNCTION get_farmer_complete_profile(p_farmer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'farmer', (SELECT row_to_json(f.*) FROM farmers f WHERE f.id = p_farmer_id),
    'financial_data', (
      SELECT row_to_json(fd.*) 
      FROM farmer_financial_data fd 
      WHERE fd.farmer_id = p_farmer_id 
      ORDER BY fd.created_at DESC 
      LIMIT 1
    ),
    'api_data', (
      SELECT row_to_json(ad.*) 
      FROM api_fetched_data ad 
      WHERE ad.farmer_id = p_farmer_id 
      ORDER BY ad.fetched_at DESC 
      LIMIT 1
    ),
    'ml_assessment', (
      SELECT row_to_json(ma.*) 
      FROM ml_assessments ma 
      WHERE ma.farmer_id = p_farmer_id 
      ORDER BY ma.assessment_date DESC 
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. VIEWS FOR EASY DATA ACCESS
-- ============================================================================

-- View combining farmer data with latest ML assessment
CREATE OR REPLACE VIEW farmer_credit_overview AS
SELECT 
  f.id AS farmer_id,
  f.full_name,
  f.email,
  f.phone,
  f.farm_location,
  f.farm_size_acres,
  fd.state,
  fd.district,
  fd.region,
  fd.crop_type,
  fd.annual_revenue,
  fd.annual_expenses,
  fd.net_profit,
  fd.loan_amount,
  fd.debt_to_equity_ratio,
  ma.predicted_credit_score,
  ma.risk_category,
  ma.assessment_date,
  ma.top_positive_factors,
  ma.top_negative_factors
FROM farmers f
LEFT JOIN farmer_financial_data fd ON f.id = fd.farmer_id
LEFT JOIN ml_assessments ma ON f.id = ma.farmer_id
WHERE ma.assessment_date = (
  SELECT MAX(assessment_date) 
  FROM ml_assessments 
  WHERE farmer_id = f.id
);

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
