-- Fix for Supabase Storage RLS Policies
-- This enables users (and admins) to upload to 'campaigns' and 'avatars' buckets securely

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaigns', 'campaigns', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for campaigns bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('campaigns', 'avatars'));

CREATE POLICY "Authenticated Users can upload media" 
ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id IN ('campaigns', 'avatars')
);

CREATE POLICY "Users can update their own media" 
ON storage.objects FOR UPDATE 
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own media" 
ON storage.objects FOR DELETE 
USING (auth.uid() = owner);
