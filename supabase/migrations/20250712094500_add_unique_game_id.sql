-- Add unique_game_id column to completed_games table
ALTER TABLE public.completed_games
ADD COLUMN unique_game_id TEXT;

-- Create an index for better performance
CREATE INDEX idx_completed_games_unique_id ON public.completed_games(unique_game_id);
