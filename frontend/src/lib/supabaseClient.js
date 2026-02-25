import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdGx5Z3hpdXpsZ3VyaXdkbmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTAzNjQsImV4cCI6MjA4NTg4NjM2NH0.KTeItNU03mT1ini_AATBSFB23fLs6YQD6pXohZ-w6fA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);