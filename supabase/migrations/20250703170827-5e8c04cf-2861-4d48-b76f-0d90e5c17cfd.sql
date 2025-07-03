
-- Create a storage bucket for player avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('player-avatars', 'player-avatars', true);

-- Create policy to allow all operations on the avatars bucket
CREATE POLICY "Allow all operations on player avatars" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'player-avatars');
