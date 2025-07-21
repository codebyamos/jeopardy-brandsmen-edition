-- Add media_assignment column to game_questions table
ALTER TABLE public.game_questions 
ADD COLUMN media_assignment TEXT DEFAULT 'both' CHECK (media_assignment IN ('question', 'answer', 'both'));

-- Update the column to be non-null with default value
UPDATE public.game_questions 
SET media_assignment = 'both' 
WHERE media_assignment IS NULL;
