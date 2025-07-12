-- Create tables for game history (run this in the Supabase SQL Editor)

-- First, drop tables if they exist (in case we need to recreate them)
DROP TABLE IF EXISTS public.completed_game_players;
DROP TABLE IF EXISTS public.completed_games;

-- Table for storing completed game sessions
CREATE TABLE public.completed_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  winner_name TEXT,
  winner_score INTEGER
);

-- Table for storing players from completed games
CREATE TABLE public.completed_game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.completed_games(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  player_score INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_completed_games_date ON public.completed_games(game_date);
CREATE INDEX idx_completed_game_players_game_id ON public.completed_game_players(game_id);

-- Enable Row Level Security (making it public for now)
ALTER TABLE public.completed_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_game_players ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (public access)
CREATE POLICY "Allow all operations on completed_games" 
  ON public.completed_games 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on completed_game_players" 
  ON public.completed_game_players 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert a test record
INSERT INTO public.completed_games (game_date, winner_name, winner_score)
VALUES (CURRENT_DATE, 'Test Winner', 500)
RETURNING id;

-- Note: You would need to use the returned ID to insert players
-- INSERT INTO public.completed_game_players (game_id, player_name, player_score, avatar_url)
-- VALUES ('returned-id-here', 'Player 1', 500, NULL);
