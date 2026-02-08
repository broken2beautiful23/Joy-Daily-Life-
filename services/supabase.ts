
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kbdjohmramlnlqgzaqsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGpvaG1yYW1sbmxxZ3phcXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDMzNDQsImV4cCI6MjA4NjExOTM0NH0.QDkb9VVgqOS6zmpFWu1fEQKFBFPRk6e-Cr_X0_aA32g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
