-- ============================================================================
-- ADD FARMER_ID COLUMN TO FARMERS TABLE
-- Migration to add farmer_id field for unique farmer identification
-- ============================================================================

-- Add farmer_id column to farmers table
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS farmer_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farmers_farmer_id ON farmers(farmer_id);

-- Add comment to document the column
COMMENT ON COLUMN farmers.farmer_id IS 'Unique farmer identification number provided by government or agricultural department';

-- Update existing rows to have a default farmer_id (optional - only if you have existing data)
-- UPDATE farmers 
-- SET farmer_id = 'FID-' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 8, '0')
-- WHERE farmer_id IS NULL;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'farmers' AND column_name = 'farmer_id';
