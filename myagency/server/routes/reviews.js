const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const requireAuth = require('../middleware/requireAuth');
const { computeOverallGrade } = require('../lib/gradeComputer');

const GRADE_FIELDS = [
  'grade_communication',
  'grade_fairness',
  'grade_accountability',
  'grade_backing_officers',
  'grade_toxic_behavior',
  'grade_promotion_fairness',
  'grade_work_life',
  'grade_morale_impact',
];

const VALID_GRADES = new Set(['A', 'B', 'C', 'D', 'F']);

function validateGrades(body) {
  for (const field of GRADE_FIELDS) {
    if (!VALID_GRADES.has(body[field])) {
      return `Invalid or missing grade for ${field}`;
    }
  }
  return null;
}

// POST /api/reviews/agency
router.post('/agency', requireAuth, async (req, res) => {
  const {
    agency_id,
    grade_communication,
    grade_fairness,
    grade_accountability,
    grade_backing_officers,
    grade_toxic_behavior,
    grade_promotion_fairness,
    grade_work_life,
    grade_morale_impact,
    review_text,
  } = req.body;

  if (!agency_id) return res.status(400).json({ error: 'agency_id is required' });

  const validationError = validateGrades(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const overall_grade = computeOverallGrade([
    grade_communication, grade_fairness, grade_accountability,
    grade_backing_officers, grade_toxic_behavior, grade_promotion_fairness,
    grade_work_life, grade_morale_impact,
  ]);

  const { data, error } = await supabaseAdmin
    .from('agency_reviews')
    .insert({
      agency_id,
      user_id: req.user.id,
      grade_communication,
      grade_fairness,
      grade_accountability,
      grade_backing_officers,
      grade_toxic_behavior,
      grade_promotion_fairness,
      grade_work_life,
      grade_morale_impact,
      overall_grade,
      review_text: review_text?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this agency' });
    }
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// POST /api/reviews/supervisor
router.post('/supervisor', requireAuth, async (req, res) => {
  const {
    agency_id,
    rank,
    grade_communication,
    grade_fairness,
    grade_accountability,
    grade_backing_officers,
    grade_toxic_behavior,
    grade_promotion_fairness,
    grade_work_life,
    grade_morale_impact,
    review_text,
  } = req.body;

  const VALID_RANKS = ['Sergeant', 'Lieutenant', 'Captain', 'Commander', 'Deputy Chief', 'Chief'];

  if (!agency_id) return res.status(400).json({ error: 'agency_id is required' });
  if (!rank || !VALID_RANKS.includes(rank)) {
    return res.status(400).json({ error: 'Valid rank is required' });
  }

  const validationError = validateGrades(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const overall_grade = computeOverallGrade([
    grade_communication, grade_fairness, grade_accountability,
    grade_backing_officers, grade_toxic_behavior, grade_promotion_fairness,
    grade_work_life, grade_morale_impact,
  ]);

  const { data, error } = await supabaseAdmin
    .from('supervisor_reviews')
    .insert({
      agency_id,
      user_id: req.user.id,
      rank,
      grade_communication,
      grade_fairness,
      grade_accountability,
      grade_backing_officers,
      grade_toxic_behavior,
      grade_promotion_fairness,
      grade_work_life,
      grade_morale_impact,
      overall_grade,
      review_text: review_text?.trim() || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data);
});

module.exports = router;
