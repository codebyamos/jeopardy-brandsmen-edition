-- Update CORS configuration for player-avatars bucket
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[],
    file_size_limit = 5242880,
    public = true
WHERE id = 'player-avatars';

-- Add CORS policy for cross-origin access
INSERT INTO storage.cors (bucket_id, allowed_origins, allowed_headers, allowed_methods, max_age_seconds)
VALUES 
  ('player-avatars', ARRAY['*'], ARRAY['*'], ARRAY['GET', 'HEAD'], 3600)
ON CONFLICT (bucket_id) 
DO UPDATE SET 
  allowed_origins = ARRAY['*'],
  allowed_headers = ARRAY['*'], 
  allowed_methods = ARRAY['GET', 'HEAD'],
  max_age_seconds = 3600;