# Farmer ID & Aadhaar Update Guide

## ✅ Changes Implemented:

### 1. **Aadhaar Number - Now Mandatory**
- Changed from "Optional" to "Required" (*)
- Must be exactly 12 digits
- Only numeric input allowed
- Updated validation logic
- Updated help text: "Required for subsidy matching and verification"

### 2. **Farmer ID Field - Added**
- New required field on signup page
- Added to form interface
- Added to database schema
- Integrated with onboarding workflow

### 3. **Database Schema Update**
- Added `farmer_id` column to `farmers` table
- Column is TEXT type with UNIQUE constraint
- Indexed for fast lookups

---

## 🗄️ Database Migration Steps:

### Step 1: Run the SQL Migration

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/qwwzjxdypoyzjbzvpseu
2. Navigate to: **SQL Editor**
3. Click **"New Query"**
4. Copy and paste this SQL:

```sql
-- Add farmer_id column to farmers table
ALTER TABLE farmers 
ADD COLUMN IF NOT EXISTS farmer_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farmers_farmer_id ON farmers(farmer_id);

-- Add comment to document the column
COMMENT ON COLUMN farmers.farmer_id IS 'Unique farmer identification number provided by government or agricultural department';
```

5. Click **"Run"** or press `Ctrl+Enter`
6. Verify success message appears

### Step 2: Verify the Migration

Run this query to confirm the column was added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'farmers' AND column_name = 'farmer_id';
```

Expected result:
```
column_name | data_type | is_nullable
------------|-----------|------------
farmer_id   | text      | YES
```

---

## 📝 Form Changes Summary:

### Before:
```
Step 1: Tell us about you
- Farmer Name *
- Email Address *
- Phone Number *
- Aadhaar Number (Optional)  ← Was optional
```

### After:
```
Step 1: Tell us about you
- Farmer Name *
- Email Address *
- Phone Number *
- Aadhaar Number *           ← Now required, 12 digits
- Farmer ID *                ← New field
```

---

## ✅ Validation Rules:

### Aadhaar Number:
- **Required**: Yes
- **Length**: Exactly 12 digits
- **Format**: Numeric only (no letters or special characters)
- **Validation**: Checked on form submission
- **Error**: "Please enter a valid 12-digit Aadhaar number"

### Farmer ID:
- **Required**: Yes
- **Format**: Any text/alphanumeric
- **Unique**: Must be unique across all farmers
- **Example**: "FID-12345678", "KA-2024-001", etc.

### Phone Number:
- **Required**: Yes
- **Length**: Exactly 10 digits
- **Format**: Numeric only

---

## 🔧 Code Changes Made:

### 1. OnboardingForm.tsx
```typescript
// Added to interface
export interface FarmerFormData {
  // ... existing fields
  aadhaarNumber: string;  // Changed from optional
  farmerId: string;       // NEW FIELD
}

// Updated validation
case 0:
  return data.farmerName && 
         data.email && 
         data.phoneNumber && 
         data.phoneNumber.length === 10 &&
         data.aadhaarNumber && 
         data.aadhaarNumber.length === 12 &&  // NEW
         data.farmerId;                        // NEW
```

### 2. Onboarding.tsx
```typescript
// Added farmerId to onboarding workflow
await enhancedSupabaseHelpers.workflow.completeOnboarding({
  // ... existing params
  aadhaarNumber: data.aadhaarNumber,  // Now required
  farmerId: data.farmerId,            // NEW
});
```

### 3. supabase-enhanced-helpers.ts
```typescript
// Added farmerId parameter
async completeOnboarding(params: {
  // ... existing params
  aadhaarNumber?: string;
  farmerId?: string;  // NEW
}) {
  // Insert farmer with farmer_id
  await supabase.from("farmers").insert({
    // ... existing fields
    farmer_id: params.farmerId,  // NEW
  });
}
```

---

## 🧪 Testing Checklist:

After applying the database migration:

- [ ] Database migration executed successfully
- [ ] `farmer_id` column exists in `farmers` table
- [ ] Index created on `farmer_id` column
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Restart dev server (`npm run dev`)
- [ ] Open signup/onboarding page
- [ ] Verify Aadhaar field shows "*" (required)
- [ ] Verify Farmer ID field is present
- [ ] Try submitting without Aadhaar (should fail)
- [ ] Try submitting with 11 digits Aadhaar (should fail)
- [ ] Try submitting with 12 digits Aadhaar (should work)
- [ ] Try submitting without Farmer ID (should fail)
- [ ] Complete full onboarding flow
- [ ] Verify data saved in database
- [ ] Check `farmers` table has `farmer_id` value

---

## 📊 Database Schema:

### farmers table (updated):
```sql
CREATE TABLE farmers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  government_id TEXT,           -- Aadhaar number
  farmer_id TEXT UNIQUE,        -- NEW: Unique farmer ID
  farm_name TEXT,
  farm_location TEXT,
  farm_size_acres NUMERIC(10, 2),
  crop_types TEXT[],
  years_farming INTEGER,
  bank_account_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚨 Important Notes:

1. **Existing Users**: If you have existing users in the database, their `farmer_id` will be NULL. You may want to:
   - Ask them to update their profile
   - Generate farmer IDs automatically
   - Make it optional for existing users

2. **Unique Constraint**: The `farmer_id` column has a UNIQUE constraint, so duplicate IDs will be rejected.

3. **Aadhaar Privacy**: Aadhaar numbers are sensitive. Ensure:
   - Data is encrypted at rest (Supabase does this by default)
   - Access is restricted via RLS policies
   - Comply with data protection regulations

4. **Farmer ID Format**: Consider implementing a standard format:
   - State code + Year + Sequential number
   - Example: "MH-2026-00001" (Maharashtra, 2026, user #1)

---

## 🎯 Next Steps:

1. **Run the database migration** (Step 1 above)
2. **Test the updated form** (Testing checklist above)
3. **Update existing users** (if any) to add farmer_id
4. **Consider auto-generating farmer IDs** for better UX
5. **Add farmer ID to dashboard** display

---

## 📞 Troubleshooting:

### Issue: Migration fails with "column already exists"
**Solution**: The column already exists. Skip migration or use `ADD COLUMN IF NOT EXISTS`.

### Issue: Form validation not working
**Solution**: 
1. Clear browser cache
2. Restart dev server
3. Check browser console for errors

### Issue: Data not saving to database
**Solution**:
1. Check Supabase logs
2. Verify RLS policies allow INSERT
3. Check network tab for API errors

---

**Status**: ✅ Complete - Ready for testing  
**Last Updated**: April 20, 2026  
**Migration File**: `add-farmer-id-migration.sql`
