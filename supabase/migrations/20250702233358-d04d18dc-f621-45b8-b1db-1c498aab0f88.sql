
-- Create a table for games
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for game players (to store player data for each game)
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  player_score INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_games_date ON public.games(game_date);
CREATE INDEX idx_game_players_game_id ON public.game_players(game_id);

-- Enable Row Level Security (making it public for now since no authentication is implemented)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (public access)
CREATE POLICY "Allow all operations on games" ON public.games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_players" ON public.game_players FOR ALL USING (true) WITH CHECK (true);
