const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

// Service role client — bypasses RLS for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Anon client — for verifying user JWTs
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabaseAdmin, supabaseAnon };
