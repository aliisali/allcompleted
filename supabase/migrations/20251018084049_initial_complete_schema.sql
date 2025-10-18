/*
  # BlindsCloud Complete Database Schema

  1. New Tables
    - `users` - User accounts with role-based access (admin, business, employee)
    - `businesses` - Business entities with subscription tiers
    - `customers` - Customer records linked to businesses
    - `jobs` - Job/task management with employee assignments
    - `products` - Product catalog with 3D models and AR support
    - `notifications` - User notifications system
    - `module_permissions` - Granular module access control
    - `models_3d` - 3D model management and conversion tracking
    - `model_permissions` - Business-level 3D model access permissions
    - `activity_logs` - Audit trail for user actions
    - `user_sessions` - Session management

  2. Security
    - Enable RLS on all tables (applied in separate migration)
    - Row-level security policies for data isolation
    - Business-level data segregation
    - Role-based access control

  3. Important Notes
    - Default admin, business, and employee users are created
    - Password for all default users: 'password'
    - UUID extension enabled for primary keys
    - Comprehensive indexing for query performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with hierarchy support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
    business_id UUID,
    parent_id UUID,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    admin_id UUID,
    features TEXT[] DEFAULT '{}',
    subscription VARCHAR(50) DEFAULT 'basic' CHECK (subscription IN ('basic', 'premium', 'enterprise')),
    vr_view_enabled BOOLEAN DEFAULT false,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    address TEXT NOT NULL,
    postcode VARCHAR(20),
    business_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'tbd', 'awaiting-deposit', 'awaiting-payment')),
    customer_id UUID NOT NULL,
    employee_id UUID,
    business_id UUID NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    quotation DECIMAL(10,2) DEFAULT 0,
    invoice DECIMAL(10,2) DEFAULT 0,
    signature TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    model_3d TEXT DEFAULT '',
    ar_model TEXT DEFAULT '',
    specifications TEXT[] DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module permissions table
CREATE TABLE IF NOT EXISTS module_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    can_access BOOLEAN DEFAULT false,
    can_grant_access BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3D Models table
CREATE TABLE IF NOT EXISTS models_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_image VARCHAR(500),
    model_url VARCHAR(500),
    thumbnail VARCHAR(500),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    settings JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model permissions table
CREATE TABLE IF NOT EXISTS model_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL,
    can_view_3d_models BOOLEAN DEFAULT false,
    can_use_in_ar BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints after all tables are created
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_business' AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_parent' AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_created_by' AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_businesses_admin' AND table_name = 'businesses'
    ) THEN
        ALTER TABLE businesses ADD CONSTRAINT fk_businesses_admin FOREIGN KEY (admin_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_customers_business' AND table_name = 'customers'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT fk_customers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_jobs_customer' AND table_name = 'jobs'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_jobs_employee' AND table_name = 'jobs'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT fk_jobs_employee FOREIGN KEY (employee_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_jobs_business' AND table_name = 'jobs'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT fk_jobs_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notifications_user' AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_module_permissions_user' AND table_name = 'module_permissions'
    ) THEN
        ALTER TABLE module_permissions ADD CONSTRAINT fk_module_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_module_permissions_granted_by' AND table_name = 'module_permissions'
    ) THEN
        ALTER TABLE module_permissions ADD CONSTRAINT fk_module_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_models_3d_created_by' AND table_name = 'models_3d'
    ) THEN
        ALTER TABLE models_3d ADD CONSTRAINT fk_models_3d_created_by FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_model_permissions_business' AND table_name = 'model_permissions'
    ) THEN
        ALTER TABLE model_permissions ADD CONSTRAINT fk_model_permissions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_model_permissions_granted_by' AND table_name = 'model_permissions'
    ) THEN
        ALTER TABLE model_permissions ADD CONSTRAINT fk_model_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_activity_logs_user' AND table_name = 'activity_logs'
    ) THEN
        ALTER TABLE activity_logs ADD CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_sessions_user' AND table_name = 'user_sessions'
    ) THEN
        ALTER TABLE user_sessions ADD CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Insert default admin user (password: 'password')
INSERT INTO users (id, email, name, password_hash, role, permissions, is_active, email_verified) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@blindscloud.co.uk',
    'BlindsCloud Admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    ARRAY['all'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default business
INSERT INTO businesses (id, name, address, phone, email, features, subscription, vr_view_enabled)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'BlindsCloud Solutions Ltd.',
    '456 Window Street, Blindfold City, BC 12345',
    '+1 (555) 123-4567',
    'contact@blindscloud.co.uk',
    ARRAY['job_management', 'calendar', 'reports', 'vr_view', '3d_models'],
    'premium',
    true
) ON CONFLICT DO NOTHING;

-- Insert default business user
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'business@blindscloud.co.uk',
    'Business Manager',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'business',
    '550e8400-e29b-41d4-a716-446655440001',
    ARRAY['manage_employees', 'view_dashboard', 'create_jobs'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default employee user
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'employee@blindscloud.co.uk',
    'Installation Specialist',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'employee',
    '550e8400-e29b-41d4-a716-446655440001',
    ARRAY['create_jobs', 'manage_tasks', 'ar_camera_access'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;