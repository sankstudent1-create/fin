import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://joanfonaixkgbpbyuwch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: adminCheck, error } = await supabase.rpc('generate_admin_otp', { user_email: 'wansank10@gmail.com' });
    console.log("OTP Check:", adminCheck, error);

}
test();
