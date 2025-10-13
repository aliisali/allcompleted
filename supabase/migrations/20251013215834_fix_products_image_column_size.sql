/*
  # Fix Products Image Column Size

  1. Changes
    - Change `image` column from varchar(500) to TEXT to support base64 images
    - Base64 images can be very large (50KB-500KB+)
    - TEXT type supports unlimited length in Postgres

  2. Security
    - No changes to RLS policies
    - Existing permissions remain unchanged
*/

-- Alter the image column to support large base64 strings
ALTER TABLE products 
ALTER COLUMN image TYPE TEXT;
