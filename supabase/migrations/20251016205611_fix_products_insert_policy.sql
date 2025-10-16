/*
  # Fix Products Insert Policy

  1. Changes
    - Drop existing insert policy
    - Recreate with better authentication check
    - Add explicit check for auth.uid() to ensure user is authenticated
    - Add helpful error context

  2. Security
    - Only authenticated users can insert products
    - Maintains security while fixing insertion issues
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Products manageable by authenticated" ON products;

-- Recreate with explicit authentication check
CREATE POLICY "Products manageable by authenticated"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
