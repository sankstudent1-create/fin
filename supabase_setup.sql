-- ORANGE FINANCE: COMPREHENSIVE SUPABASE SETUP
-- This file contains the complete schema, storage buckets, and security policies.

-- ==========================================
-- 1. TABLES & SCHEMA
-- ==========================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    icon_key TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    isEmoji BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Users can manage their own categories" 
ON public.categories FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for Transactions
CREATE POLICY "Users can manage their own transactions" 
ON public.transactions FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 3. STORAGE BUCKETS
-- ==========================================

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
-- Allow users to upload their own avatar
CREATE POLICY "Avatar upload policy" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow public to view avatars (since bucket is public, this is often redundant but good for explicit safety)
CREATE POLICY "Avatar public view" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow users to update/delete their own avatar
CREATE POLICY "Avatar owner management" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'avatars' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
);

-- ==========================================
-- 4. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_categories_user_usage ON public.categories(user_id, usage_count DESC);

-- ==========================================
-- 5. SEED DATA (OPTIONAL)
-- ==========================================
-- Note: These are example categories. The app will also allow users to create these dynamically.
-- INSERT INTO public.categories (user_id, name, type, icon_key, usage_count) VALUES
-- ('<USER_ID>', 'Food', 'expense', 'Coffee', 10),
-- ('<USER_ID>', 'Salary', 'income', 'Briefcase', 10);
