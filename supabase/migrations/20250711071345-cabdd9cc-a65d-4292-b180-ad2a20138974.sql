-- Create table for timer settings
CREATE TABLE IF NOT EXISTS public.timer_settings (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY,
  timer_duration INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timer_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since it's shared settings)
CREATE POLICY "Allow all operations on timer_settings" 
ON public.timer_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert default timer settings if not exists
INSERT INTO public.timer_settings (id, timer_duration) 
VALUES (1, 30) 
ON CONFLICT (id) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_timer_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timer_settings_updated_at
  BEFORE UPDATE ON public.timer_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timer_settings_timestamp();