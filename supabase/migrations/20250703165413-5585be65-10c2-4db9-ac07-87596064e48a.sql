
-- Create a table to store the game passcode
CREATE TABLE public.game_passcode (
  id INTEGER PRIMARY KEY DEFAULT 1,
  passcode TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the default passcode
INSERT INTO public.game_passcode (id, passcode) VALUES (1, '1234');

-- Enable Row Level Security
ALTER TABLE public.game_passcode ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a single-row table for game settings)
CREATE POLICY "Allow all operations on game_passcode" 
  ON public.game_passcode 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create a function to update the passcode and timestamp
CREATE OR REPLACE FUNCTION update_game_passcode_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the timestamp
CREATE TRIGGER update_game_passcode_timestamp
  BEFORE UPDATE ON public.game_passcode
  FOR EACH ROW
  EXECUTE FUNCTION update_game_passcode_timestamp();
