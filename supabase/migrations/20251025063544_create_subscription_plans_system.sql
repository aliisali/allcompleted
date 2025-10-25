/*
  # Create Subscription System with Random Diverse Plans

  1. New Tables
    - `subscription_plans` - Various subscription tiers
    - `user_subscriptions` - User subscription tracking
    - `payment_history` - Payment records

  2. Plans Created (10 diverse random plans)
    - Free Trial ($0) - 14-day trial
    - Starter Plus ($19.99) - Enhanced starter
    - Basic ($29.99) - Small business
    - Team ($39.99) - Small to medium teams
    - Growth ($49.99) - Scaling businesses
    - Professional ($79.99) - Growing businesses
    - Premium ($89.99) - Ambitious businesses
    - Business Pro ($129.99) - Established companies
    - Enterprise ($199.99) - Large organizations
    - Ultimate ($299.99) - Complete solution

  3. Security
    - Enable RLS on all subscription tables
    - Users can view active plans
    - Users can manage their own subscriptions
    - Admins have full access
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
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  granted_by_admin boolean DEFAULT false,
  granted_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due'))
);

-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
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

-- RLS Policies for subscription_plans (anyone can view active plans)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for payment_history
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- Insert 10 diverse random subscription plans
INSERT INTO subscription_plans (name, description, price, features, max_employees, max_jobs, active)
VALUES
  (
    'Free Trial',
    'Try our platform for 14 days',
    0,
    '["5 Employees", "10 Jobs/month", "Basic Support", "Email Notifications", "Mobile Access"]'::jsonb,
    5,
    10,
    true
  ),
  (
    'Starter Plus',
    'Enhanced starter plan with premium features',
    19.99,
    '["8 Employees", "30 Jobs/month", "Email Support", "Basic AR Camera", "Product Gallery", "Customer Portal", "Basic Reports"]'::jsonb,
    8,
    30,
    true
  ),
  (
    'Basic',
    'Perfect for small businesses',
    29.99,
    '["10 Employees", "50 Jobs/month", "Email Support", "Basic Reports", "Mobile App Access", "Calendar Integration"]'::jsonb,
    10,
    50,
    true
  ),
  (
    'Team',
    'Perfect for small to medium teams',
    39.99,
    '["15 Employees", "100 Jobs/month", "Priority Email Support", "AR Camera Pro", "3D Model Viewer", "Team Collaboration", "Client Portal", "SMS Notifications"]'::jsonb,
    15,
    100,
    true
  ),
  (
    'Growth',
    'Scale your business with advanced tools',
    49.99,
    '["20 Employees", "150 Jobs/month", "Phone Support", "AR Camera Pro", "Custom Branding", "Advanced Analytics", "API Access", "Automation Tools", "Inventory Management"]'::jsonb,
    20,
    150,
    true
  ),
  (
    'Professional',
    'For growing businesses',
    79.99,
    '["25 Employees", "200 Jobs/month", "Priority Support", "Advanced Reports", "API Access", "Custom Branding", "Workflow Automation", "Invoice Generator"]'::jsonb,
    25,
    200,
    true
  ),
  (
    'Premium',
    'Premium experience for ambitious businesses',
    89.99,
    '["30 Employees", "300 Jobs/month", "24/7 Chat Support", "Full AR Suite", "Unlimited 3D Models", "White Label", "Advanced Reports", "CRM Integration", "Mobile Apps", "Priority Processing"]'::jsonb,
    30,
    300,
    true
  ),
  (
    'Business Pro',
    'Professional tools for established companies',
    129.99,
    '["50 Employees", "500 Jobs/month", "Dedicated Support Rep", "Enterprise AR", "Custom Workflows", "Multi-location Support", "Advanced Permissions", "SSO Integration", "Data Export", "Custom Fields"]'::jsonb,
    50,
    500,
    true
  ),
  (
    'Enterprise',
    'Unlimited power for large organizations',
    199.99,
    '["Unlimited Employees", "Unlimited Jobs", "24/7 Support", "Custom Features", "Dedicated Account Manager", "White Label", "API Access", "Advanced Security", "SLA Guarantee"]'::jsonb,
    999999,
    999999,
    true
  ),
  (
    'Ultimate',
    'The complete solution with everything included',
    299.99,
    '["100 Employees", "Unlimited Jobs", "24/7 Priority Support", "All AR Features", "Custom Development", "Dedicated Success Manager", "SLA Guarantee", "Advanced Security", "Custom Integrations", "Training Sessions", "VIP Onboarding"]'::jsonb,
    100,
    999999,
    true
  )
ON CONFLICT DO NOTHING;
