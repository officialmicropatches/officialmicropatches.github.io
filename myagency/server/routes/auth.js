const express = require('express');
const router = express.Router();
const { supabaseAdmin, supabaseAnon } = require('../lib/supabase');

// Known LE domain blocklist — extend as needed
const BLOCKED_DOMAINS = [
  '.gov',
  'police.gov',
  'sheriff.gov',
  'pd.gov',
  'lapd.online',
  'nypd.org',
  'chicagopolice.org',
  'sfgov.org',
  'phoenix.gov',
  'denverpolice.org',
  'seattlepd.org',
  'miamidade.gov',
];

function isBlockedEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return BLOCKED_DOMAINS.some((domain) => lower.endsWith(domain));
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3–30 characters' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
  }

  if (email && isBlockedEmail(email)) {
    return res.status(400).json({ error: 'Do not use a work or department email address' });
  }

  // Check username uniqueness
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  // Create Supabase auth user — use a synthetic email if none provided
  const authEmail = email || `${username}@myagency.internal`;
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Insert into users table
  const { error: insertError } = await supabaseAdmin
    .from('users')
    .insert({ id: authData.user.id, username, email: email || null });

  if (insertError) {
    // Rollback auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: 'Failed to create user profile' });
  }

  // Sign in to get session tokens
  const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (signInError) {
    return res.status(201).json({ message: 'Account created. Please log in.' });
  }

  res.status(201).json({
    user: { id: authData.user.id, username },
    session: sessionData.session,
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Look up user by username to get their email
  const { data: userRecord, error: lookupError } = await supabaseAdmin
    .from('users')
    .select('id, username, email')
    .eq('username', username)
    .maybeSingle();

  if (lookupError || !userRecord) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Determine auth email
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userRecord.id);
  const authEmail = authUser?.user?.email;

  if (!authEmail) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (signInError) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    user: { id: userRecord.id, username: userRecord.username },
    session: sessionData.session,
  });
});

// POST /api/auth/logout
// Session invalidation is handled client-side via supabase.auth.signOut().
// This endpoint exists so the client can call it before clearing the local session.
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;
