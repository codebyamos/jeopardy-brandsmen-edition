-- Add the missing unique_game_id column to completed_games table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the column
ALTER TABLE public.completed_games 
ADD COLUMN IF NOT EXISTS unique_game_id TEXT;

-- Step 2: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_completed_games_unique_id 
ON public.completed_games(unique_game_id);

-- Step 3: Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'completed_games' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- You should see unique_game_id in the results
