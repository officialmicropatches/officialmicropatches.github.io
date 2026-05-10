const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');

const PAGE_SIZE = 10;

const RANK_ORDER = {
  'Chief of Police / Sheriff': 1,
  'Assistant Chief / Undersheriff': 2,
  'Deputy Chief': 3,
  'Commander': 4,
  'Captain': 5,
  'Lieutenant': 6,
  'Sergeant': 7,
  'Corporal': 8,
};

// GET /api/agencies/search?q=
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const { data, error } = await supabaseAdmin
    .from('agencies')
    .select('id, name, state, type, city, slug, overall_grade, review_count')
    .or(`name.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`)
    .order('review_count', { ascending: false })
    .limit(8);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/agencies/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const { data: agency, error } = await supabaseAdmin
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!agency) return res.status(404).json({ error: 'Agency not found' });

  const { data: commandStaff } = await supabaseAdmin
    .from('command_staff')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: true });

  res.json({ ...agency, command_staff: commandStaff || [] });
});

// GET /api/agencies/:slug/reviews?page=1
router.get('/:slug/reviews', async (req, res) => {
  const { slug } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: agency } = await supabaseAdmin
    .from('agencies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!agency) return res.status(404).json({ error: 'Agency not found' });

  const { data: reviews, error, count } = await supabaseAdmin
    .from('agency_reviews')
    .select(`
      id, overall_grade, grade_communication, grade_fairness,
      grade_accountability, grade_backing_officers, grade_morale,
      grade_promotion_fairness, grade_work_life, grade_toxic_leadership,
      review_text, created_at,
      users(username)
    `, { count: 'exact' })
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ reviews: reviews || [], total: count || 0, page, page_size: PAGE_SIZE });
});

// GET /api/agencies/:slug/supervisors
router.get('/:slug/supervisors', async (req, res) => {
  const { slug } = req.params;

  const { data: agency } = await supabaseAdmin
    .from('agencies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!agency) return res.status(404).json({ error: 'Agency not found' });

  const { data: supervisors, error } = await supabaseAdmin
    .from('supervisors')
    .select(`
      id, display_name, rank, slug, overall_grade, review_count,
      supervisor_reviews(review_text, created_at, overall_grade)
    `)
    .eq('agency_id', agency.id);

  if (error) return res.status(500).json({ error: error.message });

  const sorted = (supervisors || []).sort((a, b) => {
    const ra = RANK_ORDER[a.rank] ?? 99;
    const rb = RANK_ORDER[b.rank] ?? 99;
    if (ra !== rb) return ra - rb;
    // within same rank, most recently reviewed first
    const latestA = a.supervisor_reviews?.sort((x, y) => new Date(y.created_at) - new Date(x.created_at))[0]?.created_at || '';
    const latestB = b.supervisor_reviews?.sort((x, y) => new Date(y.created_at) - new Date(x.created_at))[0]?.created_at || '';
    return latestB.localeCompare(latestA);
  });

  // Attach preview (most recent review_text)
  const withPreview = sorted.map((s) => {
    const reviews = (s.supervisor_reviews || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const preview = reviews.find((r) => r.review_text)?.review_text || null;
    const { supervisor_reviews: _, ...rest } = s;
    return { ...rest, preview };
  });

  res.json(withPreview);
});

// GET /api/agencies/:slug/questions?page=1
router.get('/:slug/questions', async (req, res) => {
  const { slug } = req.params;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: agency } = await supabaseAdmin
    .from('agencies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (!agency) return res.status(404).json({ error: 'Agency not found' });

  const { data: questions, error, count } = await supabaseAdmin
    .from('questions')
    .select(`
      id, body, created_at, is_flagged,
      users(username),
      question_replies(
        id, body, created_at, is_flagged,
        users(username)
      )
    `, { count: 'exact' })
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ questions: questions || [], total: count || 0, page, page_size: PAGE_SIZE });
});

module.exports = router;
