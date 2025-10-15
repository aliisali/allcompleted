/*
  # Subscription System for Business Users

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (e.g., "Basic", "Pro", "Enterprise")
      - `description` (text) - Plan description
      - `price` (numeric) - Monthly price
      - `features` (jsonb) - Array of feature names
      - `max_employees` (integer) - Maximum employees allowed
      - `max_jobs` (integer) - Maximum jobs per month
      - `stripe_price_id` (text) - Stripe Price ID
      - `active` (boolean) - Is plan available for purchase
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `plan_id` (uuid, foreign key to subscription_plans)
      - `status` (text) - active, cancelled, expired, trial
      - `stripe_customer_id` (text) - Stripe Customer ID
      - `stripe_subscription_id` (text) - Stripe Subscription ID
      - `current_period_start` (timestamptz) - Subscription period start
      - `current_period_end` (timestamptz) - Subscription period end
      - `cancel_at_period_end` (boolean) - Will cancel at end
      - `granted_by_admin` (boolean) - Manually granted by admin
      - `granted_by` (uuid, foreign key to users) - Admin who granted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `payment_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `subscription_id` (uuid, foreign key to user_subscriptions)
      - `amount` (numeric) - Payment amount
      - `currency` (text) - Currency code (USD, EUR, etc)
      - `stripe_payment_intent_id` (text) - Stripe Payment Intent ID
      - `stripe_invoice_id` (text) - Stripe Invoice ID
      - `status` (text) - succeeded, failed, pending, refunded
      - `payment_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Business users can read their own subscriptions
    - Admin users can read/write all subscriptions and plans
    - Payment history readable by owner and admin
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  max_employees integer DEFAULT 5,
  max_jobs integer DEFAULT 50,
  stripe_price_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  granted_by_admin boolean DEFAULT false,
  granted_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due'))
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  status text NOT NULL DEFAULT 'pending',
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_status CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded'))
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admin can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all subscriptions"
  ON user_subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create their own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage payment history"
  ON payment_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, features, max_employees, max_jobs, active)
VALUES
  (
    'Free Trial',
    'Try our platform for 14 days',
    0,
    '["5 Employees", "10 Jobs/month", "Basic Support", "Email Notifications"]'::jsonb,
    5,
    10,
    true
  ),
  (
    'Basic',
    'Perfect for small businesses',
    29.99,
    '["10 Employees", "50 Jobs/month", "Email Support", "Basic Reports", "Mobile App Access"]'::jsonb,
    10,
    50,
    true
  ),
  (
    'Professional',
    'For growing businesses',
    79.99,
    '["25 Employees", "200 Jobs/month", "Priority Support", "Advanced Reports", "API Access", "Custom Branding"]'::jsonb,
    25,
    200,
    true
  ),
  (
    'Enterprise',
    'Unlimited power for large organizations',
    199.99,
    '["Unlimited Employees", "Unlimited Jobs", "24/7 Support", "Custom Features", "Dedicated Account Manager", "White Label"]'::jsonb,
    999999,
    999999,
    true
  )
ON CONFLICT DO NOTHING;

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_name text,
  status text,
  period_end timestamptz,
  max_employees integer,
  max_jobs integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    sp.name,
    us.status,
    us.current_period_end,
    sp.max_employees,
    sp.max_jobs
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
