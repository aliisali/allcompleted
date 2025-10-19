/*
  # Fix business_id requirement for customers and jobs

  1. Changes
    - Create a default business for the system
    - Update all users to have a business_id
    - Ensure foreign key constraints work properly

  2. Purpose
    - Fix 409 errors when creating customers due to missing business_id
    - Ensure all users have a valid business reference
*/

-- Create a default business if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM businesses LIMIT 1) THEN
    INSERT INTO businesses (id, name, email, phone, address, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'BlindsCloud Default Business',
      'business@blindscloud.co.uk',
      '0800-000-000',
      '123 Business Street, London, UK',
      now(),
      now()
    );
  END IF;
END $$;

-- Update all users without business_id to use the default business
UPDATE users 
SET business_id = '00000000-0000-0000-0000-000000000001' 
WHERE business_id IS NULL AND role IN ('business', 'employee');
