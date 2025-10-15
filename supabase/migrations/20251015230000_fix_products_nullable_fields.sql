/*
  # Fix Products Table - Make Image and Description Nullable

  1. Changes
    - Make `image` column nullable (allow NULL values)
    - Make `description` column nullable (allow NULL values)
    - This allows products to be created without images initially
    - Images can be added later after product creation

  2. Why
    - Users may want to create products and add images later
    - Not all products require images immediately
    - Prevents "NOT NULL constraint violation" errors

  3. Security
    - No changes to RLS policies
    - Existing permissions remain unchanged
*/

-- Make image column nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'image'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE products
    ALTER COLUMN image DROP NOT NULL;
  END IF;
END $$;

-- Make description column nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'description'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE products
    ALTER COLUMN description DROP NOT NULL;
  END IF;
END $$;

-- Update any existing NULL values to empty strings if needed (for consistency)
UPDATE products SET image = '' WHERE image IS NULL;
UPDATE products SET description = '' WHERE description IS NULL;
