-- 1. Create table for storing OTPs
CREATE TABLE IF NOT EXISTS public.admin_2fa_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_2fa_codes ENABLE ROW LEVEL SECURITY;
-- Only the user can access their own codes, or admin
CREATE POLICY "Users can manage own codes" ON public.admin_2fa_codes USING (auth.uid() = user_id);

-- 2. Create function to generate and store OTP
CREATE OR REPLACE FUNCTION generate_admin_otp(user_email text)
RETURNS text AS $$
DECLARE
    v_user_id uuid;
    v_code text;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Generate 6 digit code
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Delete old codes
    DELETE FROM public.admin_2fa_codes WHERE user_id = v_user_id;

    -- Insert new code
    INSERT INTO public.admin_2fa_codes (user_id, code, expires_at)
    VALUES (v_user_id, v_code, now() + interval '10 minutes');

    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_admin_otp(user_email text, submitted_code text)
RETURNS boolean AS $$
DECLARE
    v_user_id uuid;
    v_valid boolean;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
    IF v_user_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.admin_2fa_codes
        WHERE user_id = v_user_id 
          AND code = submitted_code 
          AND expires_at > now()
    ) INTO v_valid;

    IF v_valid THEN
        -- Delete the code after successful verification so it can't be reused
        DELETE FROM public.admin_2fa_codes WHERE user_id = v_user_id;
    END IF;

    RETURN v_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
