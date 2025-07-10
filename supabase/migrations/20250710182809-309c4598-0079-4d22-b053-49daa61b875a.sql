
-- Add bonus_points column to game_questions table
ALTER TABLE public.game_questions 
ADD COLUMN bonus_points INTEGER DEFAULT 0;

-- Create a table for category descriptions
CREATE TABLE public.game_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, category_name)
);

-- Enable Row Level Security
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations on game_categories
CREATE POLICY "Allow all operations on game_categories" 
  ON public.game_categories 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_game_categories_game_id ON public.game_categories(game_id);

-- Add image_url and video_url columns to game_questions
ALTER TABLE public.game_questions 
ADD COLUMN image_url TEXT,
ADD COLUMN video_url TEXT;
