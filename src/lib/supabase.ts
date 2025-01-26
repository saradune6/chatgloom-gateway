import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmttfpuvjfdmncxrewjx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHRmcHV2amZkbW5jeHJld2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NDMyODIsImV4cCI6MjA1MzIxOTI4Mn0.nHqtedSCK9bjuWWzpM0Z0AyhR843BM0OVS82yGn4YbU';

export const supabase = createClient(supabaseUrl, supabaseKey);