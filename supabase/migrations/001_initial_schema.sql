-- FarmTrust Bloom Database Schema
-- This file creates all necessary tables for the application

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FARMER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  village TEXT,
  farm_size DECIMAL,
  main_crop TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);

-- ============================================
-- ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Input data
  enterprise_size TEXT,
  region TEXT,
  quarter TEXT,
  annual_revenue DECIMAL,
  annual_expenses DECIMAL,
  loan_amount DECIMAL,
  landholding_size DECIMAL,
  crop_type TEXT,
  irrigation_type TEXT,
  
  -- Results from ML service
  credit_score DECIMAL NOT NULL,
  probability_of_default DECIMAL,
  risk_category TEXT,
  lending_recommendation TEXT,
  
  -- Additional scores (for display)
  financial_score DECIMAL,
  agricultural_score DECIMAL,
  resilience_score DECIMAL,
  enabler_score DECIMAL,
  
  -- Metadata
  model_version TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_user_created ON assessments(user_id, created_at DESC);

-- ============================================
-- SUBSIDY MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subsidy_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  scheme_id TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  benefits TEXT,
  match_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subsidy_matches_assessment_id ON subsidy_matches(assessment_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FARMER PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON farmer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON farmer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON farmer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON farmer_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ASSESSMENTS POLICIES
-- ============================================

-- Users can view their own assessments
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert own assessments" ON assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments" ON assessments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SUBSIDY MATCHES POLICIES
-- ============================================

-- Users can view subsidy matches for their own assessments
CREATE POLICY "Users can view own subsidy matches" ON subsidy_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = subsidy_matches.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Users can insert subsidy matches for their own assessments
CREATE POLICY "Users can insert own subsidy matches" ON subsidy_matches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = subsidy_matches.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Users can delete subsidy matches for their own assessments
CREATE POLICY "Users can delete own subsidy matches" ON subsidy_matches
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = subsidy_matches.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on farmer_profiles
CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON farmer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE farmer_profiles IS 'Stores farmer profile information';
COMMENT ON TABLE assessments IS 'Stores credit assessment history';
COMMENT ON TABLE subsidy_matches IS 'Stores subsidy matches for each assessment';

COMMENT ON COLUMN farmer_profiles.user_id IS 'References auth.users - one profile per user';
COMMENT ON COLUMN assessments.credit_score IS 'Credit score from ML model (0-100)';
COMMENT ON COLUMN assessments.probability_of_default IS 'Probability of default (0-1)';
COMMENT ON COLUMN subsidy_matches.match_score IS 'How well the subsidy matches (0-1)';
