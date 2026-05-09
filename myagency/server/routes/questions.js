const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const requireAuth = require('../middleware/requireAuth');

// POST /api/questions
router.post('/', requireAuth, async (req, res) => {
  const { agency_id, body } = req.body;

  if (!agency_id) return res.status(400).json({ error: 'agency_id is required' });
  if (!body?.trim()) return res.status(400).json({ error: 'Question body is required' });

  const { data, error } = await supabaseAdmin
    .from('questions')
    .insert({ agency_id, user_id: req.user.id, body: body.trim() })
    .select(`id, body, created_at, users(username)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/questions/:id/replies
router.post('/:id/replies', requireAuth, async (req, res) => {
  const { id: question_id } = req.params;
  const { body } = req.body;

  if (!body?.trim()) return res.status(400).json({ error: 'Reply body is required' });

  // Verify question exists
  const { data: question } = await supabaseAdmin
    .from('questions')
    .select('id')
    .eq('id', question_id)
    .maybeSingle();

  if (!question) return res.status(404).json({ error: 'Question not found' });

  const { data, error } = await supabaseAdmin
    .from('question_replies')
    .insert({ question_id, user_id: req.user.id, body: body.trim() })
    .select(`id, body, created_at, users(username)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
