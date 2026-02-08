
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzgsrrdkwmzdqbtikqhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Z3NycmRrd216ZHFidGlrcWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzg0MzAsImV4cCI6MjA4NjA1NDQzMH0.EgKfHLlkJNZoZ8_QeQ2RZLkuffjyi4OohIjUg42JWKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
