-- Clear all storage URLs from game_players table
UPDATE game_players 
SET avatar_url = NULL 
WHERE avatar_url LIKE 'https://%supabase.co/storage%';

-- Also clear any storage URLs from the recent game data that might be cached
UPDATE game_players 
SET avatar_url = NULL 
WHERE avatar_url LIKE '%player-avatars%';