/*
  # Add Missing Job Columns

  1. Changes
    - Add job_type column (measurement or installation)
    - Add scheduled_time column for time of day
    - Add deposit and payment tracking columns
    - Add job history tracking column
    - Add measurements and selected products columns
    - Add parent_job_id for linking measurement to installation jobs

  2. Notes
    - All new columns are nullable to support existing data
    - Default values provided where appropriate
*/

-- Add job_type column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50) DEFAULT 'installation';

-- Add scheduled_time column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS scheduled_time VARCHAR(10) DEFAULT '09:00';

-- Add deposit and payment columns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS deposit NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_reference VARCHAR(255);

-- Add job flow tracking
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS quotation_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Add measurements and products
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS measurements JSONB,
ADD COLUMN IF NOT EXISTS selected_products JSONB;

-- Add job history
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_history JSONB DEFAULT '[]'::jsonb;

-- Add parent job link
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_parent_job_id ON jobs(parent_job_id);
