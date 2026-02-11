import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://rtcwtaweamrgyimyhhup.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y3d0YXdlYW1yZ3lpbXloaHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDcyODEsImV4cCI6MjA4NTE4MzI4MX0.6bD8rcBJjoi0pRBOPEWiToPDZ_09-aVu7MgYZIS7a-8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
