/*
  # Enable RLS and Configure Access Policies

  1. Security Changes
    - Enable Row Level Security (RLS) on all tables
    - Create policies to allow anonymous and authenticated access for all operations
    - This enables the application to function without Supabase Auth while maintaining RLS structure

  2. Tables Affected
    - users
    - businesses
    - customers
    - jobs
    - products
    - notifications
    - module_permissions
    - models_3d
    - model_permissions
    - activity_logs
    - user_sessions

  3. Important Notes
    - Policies allow both anon and authenticated roles for all operations
    - Application-level security controls actual access
    - RLS is enabled for future fine-grained control
*/

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON businesses;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON jobs;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON module_permissions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON models_3d;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON model_permissions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON activity_logs;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_sessions;

-- Users table policies
CREATE POLICY "Users viewable by all"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users insertable by all"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users updatable by all"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users deletable by all"
  ON users FOR DELETE
  TO anon, authenticated
  USING (true);

-- Businesses table policies
CREATE POLICY "Businesses viewable by all"
  ON businesses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Businesses insertable by all"
  ON businesses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Businesses updatable by all"
  ON businesses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Businesses deletable by all"
  ON businesses FOR DELETE
  TO anon, authenticated
  USING (true);

-- Customers table policies
CREATE POLICY "Customers viewable by all"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Customers insertable by all"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Customers updatable by all"
  ON customers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Customers deletable by all"
  ON customers FOR DELETE
  TO anon, authenticated
  USING (true);

-- Jobs table policies
CREATE POLICY "Jobs viewable by all"
  ON jobs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Jobs insertable by all"
  ON jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Jobs updatable by all"
  ON jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Jobs deletable by all"
  ON jobs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Products table policies
CREATE POLICY "Products viewable by all"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Products insertable by all"
  ON products FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Products updatable by all"
  ON products FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Products deletable by all"
  ON products FOR DELETE
  TO anon, authenticated
  USING (true);

-- Notifications table policies
CREATE POLICY "Notifications viewable by all"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Notifications insertable by all"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Notifications updatable by all"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Notifications deletable by all"
  ON notifications FOR DELETE
  TO anon, authenticated
  USING (true);

-- Module permissions table policies
CREATE POLICY "Module permissions viewable by all"
  ON module_permissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Module permissions insertable by all"
  ON module_permissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Module permissions updatable by all"
  ON module_permissions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Module permissions deletable by all"
  ON module_permissions FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3D Models table policies
CREATE POLICY "Models 3D viewable by all"
  ON models_3d FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Models 3D insertable by all"
  ON models_3d FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Models 3D updatable by all"
  ON models_3d FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Models 3D deletable by all"
  ON models_3d FOR DELETE
  TO anon, authenticated
  USING (true);

-- Model permissions table policies
CREATE POLICY "Model permissions viewable by all"
  ON model_permissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Model permissions insertable by all"
  ON model_permissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Model permissions updatable by all"
  ON model_permissions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Model permissions deletable by all"
  ON model_permissions FOR DELETE
  TO anon, authenticated
  USING (true);

-- Activity logs table policies
CREATE POLICY "Activity logs viewable by all"
  ON activity_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Activity logs insertable by all"
  ON activity_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Activity logs updatable by all"
  ON activity_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Activity logs deletable by all"
  ON activity_logs FOR DELETE
  TO anon, authenticated
  USING (true);

-- User sessions table policies
CREATE POLICY "User sessions viewable by all"
  ON user_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "User sessions insertable by all"
  ON user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "User sessions updatable by all"
  ON user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "User sessions deletable by all"
  ON user_sessions FOR DELETE
  TO anon, authenticated
  USING (true);