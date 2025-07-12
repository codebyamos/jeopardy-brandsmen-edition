-- Add unique_game_id column to completed_games table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.completed_games
ADD COLUMN IF NOT EXISTS unique_game_id TEXT;

-- Create an index for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_completed_games_unique_id ON public.completed_games(unique_game_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'completed_games' 
AND table_schema = 'public'
ORDER BY ordinal_position;
