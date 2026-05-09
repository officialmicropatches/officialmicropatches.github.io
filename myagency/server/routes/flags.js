const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const requireAuth = require('../middleware/requireAuth');

const VALID_CONTENT_TYPES = ['agency_review', 'supervisor_review', 'question', 'reply'];
const VALID_REASONS = ['Doxxing / Personal Info', 'Harassment', 'Spam', 'Inaccurate / Fake', 'Other'];

// POST /api/flags
router.post('/', requireAuth, async (req, res) => {
  const { content_type, content_id, reason } = req.body;

  if (!VALID_CONTENT_TYPES.includes(content_type)) {
    return res.status(400).json({ error: 'Invalid content_type' });
  }
  if (!content_id) return res.status(400).json({ error: 'content_id is required' });
  if (reason && !VALID_REASONS.includes(reason)) {
    return res.status(400).json({ error: 'Invalid reason' });
  }

  const { data, error } = await supabaseAdmin
    .from('flags')
    .insert({
      reporter_user_id: req.user.id,
      content_type,
      content_id,
      reason: reason || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Content flagged for review', id: data.id });
});

module.exports = router;
