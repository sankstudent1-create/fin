
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://joanfonaixkgbpbyuwch.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvYW5mb25haXhrZ2JwYnl1d2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMjk2NjQsImV4cCI6MjA4NzYwNTY2NH0.KpWdsdb5oWStJMZsmE1dJyqRCqDVD4tfN-d3IVn2yec";

export const supabase = createClient(supabaseUrl, supabaseKey);
