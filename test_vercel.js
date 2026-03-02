import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joanfonaixkgbpbyuwch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVercelLogs() {
    console.log("If this is a 500 but nothing crashes, it might be nodemailer.");
    
    const transporterDetails = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
    };
    console.log(transporterDetails);
}
testVercelLogs();
