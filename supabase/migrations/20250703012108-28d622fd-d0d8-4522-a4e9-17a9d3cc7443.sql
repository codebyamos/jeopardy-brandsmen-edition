
-- Create a table for voice settings
CREATE TABLE public.voice_settings (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY,
  api_key TEXT,
  selected_voice TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- Enable Row Level Security
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since it's app-wide settings)
CREATE POLICY "Allow all operations on voice_settings" 
  ON public.voice_settings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_voice_settings_updated_at ON public.voice_settings(updated_at);
