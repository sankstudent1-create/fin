import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://joanfonaixkgbpbyuwch.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: users, error } = await supabase.rpc('generate_admin_otp', { user_email: 'sanketwanve10@gmail.com' });
    console.log("OTP Check with service role:", users, error);

}
test();
