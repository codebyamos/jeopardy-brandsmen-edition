-- Clear all invalid storage URLs from player avatars
-- This will force players to re-upload their avatars as base64
UPDATE game_players 
SET avatar_url = NULL 
WHERE avatar_url LIKE 'https://gzflmkzdxalzgjhjwzwf.supabase.co/storage/v1/object/public/player-avatars/%';