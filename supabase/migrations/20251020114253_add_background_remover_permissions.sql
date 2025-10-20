/*
  # Add Background Remover Permissions

  1. Changes
    - Add `background_remover` module to module_permissions system
    - Add `bg_remover_enabled` flag to businesses table
    - This allows hierarchical permission:
      * Admin can enable for any business
      * Business can enable for their employees
      * Employees inherit from business permissions

  2. Security
    - RLS policies already exist for module_permissions table
    - Business-level flag controls feature availability
    - Module permissions control individual user access

  3. Notes
    - Background remover permission ID: 'background_remover'
    - Admins have access by default
    - Businesses must be granted access by admin
    - Employees must be granted access by their business
*/

-- Add background remover enabled flag to businesses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'bg_remover_enabled'
  ) THEN
    ALTER TABLE businesses ADD COLUMN bg_remover_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_module_permissions_module_user 
  ON module_permissions(module_id, user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_bg_remover 
  ON businesses(bg_remover_enabled);

-- Add comment for documentation
COMMENT ON COLUMN businesses.bg_remover_enabled IS 'Enables AI background removal feature for this business and its employees';
