const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

const PAGE_SIZE = 10;

// GET /api/supervisors/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const { data: supervisor, error } = await supabaseAdmin
    .from('supervisors')
    .select(`*, agencies(id, name, slug, city, state, type)`)
    .eq('slug', slug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!supervisor) return res.status(404).json({ error: 'Supervisor not found' });

  res.json(supervisor);
});

// GET /api/supervisors/:slug/reviews?page=1
router.get('/:slug/reviews', async (req, res) => {
  const { slug } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: supervisor } = await supabaseAdmin
    .from('supervisors')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!supervisor) return res.status(404).json({ error: 'Supervisor not found' });

  const { data: reviews, error, count } = await supabaseAdmin
    .from('supervisor_reviews')
    .select(`
      id, overall_grade,
      grade_communication, grade_fairness, grade_accountability,
      grade_professionalism, grade_retaliation, grade_morale_impact,
      grade_backing_officers, grade_promotion_fairness, grade_assignment_fairness,
      review_text, created_at,
      users(username)
    `, { count: 'exact' })
    .eq('supervisor_id', supervisor.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: reviews || [], total: count || 0, page, page_size: PAGE_SIZE });
});

module.exports = router;
