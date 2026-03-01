-- =========================================================================
-- ORANGE FINANCE: ADMIN PANEL SETUP SCRIPT
-- Run this script in the Supabase SQL Editor to enable Admin Panel features.
-- =========================================================================

-- 1. Create the 'admins' table
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view own record
CREATE POLICY "Admins can view own admin record" ON public.admins 
FOR SELECT USING (auth.uid() = id);

-- 2. Create a fast Secure Function (RPC) to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Extend Transaction Policies for Admins
-- Add these policies alongside the existing user-specific ones.
-- (Supabase combines multiple SELECT policies with OR automatically)
CREATE POLICY "Admin full SELECT on transactions" ON public.transactions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin full INSERT on transactions" ON public.transactions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin full UPDATE on transactions" ON public.transactions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin full DELETE on transactions" ON public.transactions FOR DELETE USING (public.is_admin());

-- 4. Extend Categories Policies for Admins
CREATE POLICY "Admin full SELECT on categories" ON public.categories FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin full INSERT on categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin full UPDATE on categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin full DELETE on categories" ON public.categories FOR DELETE USING (public.is_admin());


-- =========================================================================
-- SECURITY DEFINER RPC FUNCTIONS (Bypasses RLS wrapper for specific tasks)
-- =========================================================================

-- 5. Get all registered system users (Admins Only)
-- This reads directly from auth.users (which normal users cannot do)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Strict Authorization Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized. Admin privileges required.';
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', u.id,
      'email', u.email,
      'full_name', u.raw_user_meta_data->>'full_name',
      'avatar_url', u.raw_user_meta_data->>'avatar_url',
      'created_at', u.created_at,
      'last_sign_in_at', u.last_sign_in_at
    )
  ) INTO result
  FROM auth.users u;

  RETURN COALESCE(result, '[]'::json);
END;
$$;


-- 6. Delete a target user (Admins Only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Strict Authorization Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized. Admin privileges required.';
  END IF;

  -- Ensure admins cannot accidentally delete themselves this way
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own admin account. Please ask another admin.';
  END IF;
  
  -- Supabase auth.users delete will CASCADE and remove public.transactions automatically
  -- assuming the schemas were built with ON DELETE CASCADE constraints.
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;


-- =========================================================================
-- IMPORTANT NEXT STEPS:
-- To add your first admin, manually insert your UUID into the admins table.
-- e.g., INSERT INTO public.admins (id, email) VALUES ('your-uuid', 'your-email@example.com');
-- =========================================================================
