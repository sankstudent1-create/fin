-- 1. App Settings Table (For controlling Homescreen Message & Features)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id integer PRIMARY KEY DEFAULT 1,
    show_support_banner boolean DEFAULT false,
    support_title text DEFAULT 'Support Us',
    support_message text DEFAULT 'We build this app with love...',
    support_image_url text DEFAULT '',
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public SELECT on app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin full on app_settings" ON public.app_settings USING (public.is_admin());

INSERT INTO public.app_settings (id, show_support_banner, support_title, support_message) 
VALUES (1, true, 'Support Orange Finance', 'We rely on your support to keep things running smoothly.')
ON CONFLICT (id) DO NOTHING;

-- 2. User Devices Table (For tracking devices and push notifications)
CREATE TABLE IF NOT EXISTS public.user_devices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id text UNIQUE NOT NULL,
    device_name text,
    browser text,
    os text,
    push_subscription jsonb,
    created_at timestamp with time zone DEFAULT now(),
    last_active timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own devices" ON public.user_devices USING (auth.uid() = user_id);
CREATE POLICY "Admins full on devices" ON public.user_devices USING (public.is_admin());

-- 3. User Sessions / Activity Logs
CREATE TABLE IF NOT EXISTS public.app_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id text REFERENCES public.user_devices(device_id) ON DELETE CASCADE,
    ip_address text,
    geo_location text,
    session_start timestamp with time zone DEFAULT now(),
    session_end timestamp with time zone,
    time_spent_seconds integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.app_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.app_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.app_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full on sessions" ON public.app_sessions USING (public.is_admin());

-- RPC to update session time securely
CREATE OR REPLACE FUNCTION update_session_time(p_session_id uuid, p_seconds integer)
RETURNS void AS $$
BEGIN
  UPDATE public.app_sessions 
  SET time_spent_seconds = time_spent_seconds + p_seconds,
      session_end = now()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
