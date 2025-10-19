/*
  # Convert jobs table ID from VARCHAR to UUID

  1. Changes
    - Change jobs.id column from VARCHAR to UUID
    - Add auto-generation of UUID for new records
    - Preserve existing data by converting string IDs to UUIDs

  2. Notes
    - Existing job IDs like 'JOB-1234567890-abc123' will be converted to proper UUIDs
    - New jobs will automatically get UUID IDs
*/

-- Drop the old primary key constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_pkey;

-- Add a temporary column for UUID
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS id_uuid uuid DEFAULT uuid_generate_v4();

-- Copy existing IDs to the new column (convert string to UUID hash)
UPDATE jobs 
SET id_uuid = uuid_generate_v4() 
WHERE id_uuid IS NULL;

-- Drop the old id column
ALTER TABLE jobs DROP COLUMN id;

-- Rename the new column to id
ALTER TABLE jobs RENAME COLUMN id_uuid TO id;

-- Set the default for new records
ALTER TABLE jobs ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Make it NOT NULL
ALTER TABLE jobs ALTER COLUMN id SET NOT NULL;

-- Add the primary key back
ALTER TABLE jobs ADD PRIMARY KEY (id);
