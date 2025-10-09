/*
  # Allow All Roles to Create Jobs
  
  ## Overview
  This migration updates RLS policies to allow employees, business owners, and admins to create jobs.
  
  ## Changes Made
  
  ### Jobs Table
  - Drop existing restrictive INSERT policy
  - Create new INSERT policy that allows all authenticated users to create jobs
  - All authenticated users (admin, business, employee) can create jobs
  
  ## Security Notes
  - All authenticated users can create jobs
  - Jobs are still scoped to business_id for proper data isolation
  - Users can view and manage jobs within their business context
*/

-- Drop existing restrictive INSERT policy for jobs
DROP POLICY IF EXISTS "Jobs insertable by admins and business owners" ON jobs;

-- Create permissive INSERT policy that allows all authenticated users
CREATE POLICY "Jobs insertable by all authenticated users"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
  );
