
-- Create a table for game questions
CREATE TABLE public.game_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  question_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations on game_questions
CREATE POLICY "Allow all operations on game_questions" 
  ON public.game_questions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_game_questions_game_id ON public.game_questions(game_id);
CREATE INDEX idx_game_questions_question_id ON public.game_questions(question_id);
