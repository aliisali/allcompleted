/*
  # Restrict Employee Job Creation
  
  ## Overview
  This migration updates RLS policies to prevent employees from creating jobs.
  Only admins and business owners can create jobs.
  
  ## Changes Made
  
  ### Jobs Table
  - Drop existing permissive INSERT policy
  - Create new INSERT policy that only allows admins and business owners to create jobs
  - Employees can still view and update jobs assigned to them
  
  ## Security Notes
  - Employees cannot create new jobs
  - Employees can view jobs in their business
  - Employees can update jobs assigned to them
  - Admins and business owners have full job creation rights
*/

-- Drop existing overly permissive INSERT policy for jobs
DROP POLICY IF EXISTS "Jobs insertable by authenticated" ON jobs;

-- Create restrictive INSERT policy that excludes employees
-- Only admins and business owners can create jobs
CREATE POLICY "Jobs insertable by admins and business owners"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'business')
    )
  );
