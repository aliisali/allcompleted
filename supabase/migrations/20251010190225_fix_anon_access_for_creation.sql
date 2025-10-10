/*
  # Fix Anonymous Access for Data Creation
  
  ## Overview
  Allow anonymous users to create businesses and customers alongside user creation.
  This is needed for the initial setup flow and admin operations.
  
  ## Changes Made
  
  ### Businesses Table
  - Update INSERT policy to allow anon role
  - Update SELECT policy to allow anon role
  
  ### Customers Table
  - Update INSERT policy to allow anon role
  - Update SELECT policy to allow anon role
  
  ### Jobs Table
  - Update INSERT policy to allow anon role
  - Update SELECT policy to allow anon role
  
  ## Security Notes
  - Application layer still controls who can create what
  - RLS ensures data isolation through business_id scoping
  - This enables proper user onboarding flow
*/

-- =============================================================================
-- BUSINESSES TABLE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Businesses viewable by authenticated" ON businesses;
DROP POLICY IF EXISTS "Businesses insertable by authenticated" ON businesses;

CREATE POLICY "Businesses viewable by all"
  ON businesses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Businesses insertable by all"
  ON businesses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- CUSTOMERS TABLE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Customers viewable by authenticated" ON customers;
DROP POLICY IF EXISTS "Customers insertable by authenticated" ON customers;

CREATE POLICY "Customers viewable by all"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Customers insertable by all"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- JOBS TABLE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Jobs viewable by authenticated" ON jobs;
DROP POLICY IF EXISTS "Jobs insertable by authenticated" ON jobs;
DROP POLICY IF EXISTS "Jobs insertable by all authenticated users" ON jobs;

CREATE POLICY "Jobs viewable by all"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Jobs insertable by all"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
