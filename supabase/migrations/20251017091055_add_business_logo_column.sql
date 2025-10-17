/*
  # Add Logo Column to Businesses Table

  1. Changes
    - Add `logo` column to `businesses` table
    - Column type: TEXT (to store base64 encoded images or URLs)
    - Nullable: YES (logo is optional)
    - Default: NULL

  2. Purpose
    - Allow businesses to upload and display custom logos
    - Improves brand identity in the system
    - Used in business cards and admin interface

  3. Security
    - No RLS changes needed
    - Existing policies apply to the new column
*/

-- Add logo column to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'logo'
  ) THEN
    ALTER TABLE businesses ADD COLUMN logo TEXT;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN businesses.logo IS 'Business logo as base64 encoded image or URL';
