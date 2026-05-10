const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabase');
const requireAuth = require('../middleware/requireAuth');
const { computeOverallGrade } = require('../lib/gradeComputer');

const VALID_GRADES = new Set(['A', 'B', 'C', 'D', 'F']);

const AGENCY_GRADE_FIELDS = [
  'grade_communication',
  'grade_fairness',
  'grade_accountability',
  'grade_backing_officers',
  'grade_morale',
  'grade_promotion_fairness',
  'grade_work_life',
  'grade_toxic_leadership',
];

const SUPERVISOR_GRADE_FIELDS = [
  'grade_communication',
  'grade_fairness',
  'grade_accountability',
  'grade_professionalism',
  'grade_retaliation',
  'grade_morale_impact',
  'grade_backing_officers',
  'grade_promotion_fairness',
  'grade_assignment_fairness',
];

function validateGrades(body, fields) {
  for (const field of fields) {
    if (!VALID_GRADES.has(body[field])) {
      return `Invalid or missing grade for ${field}`;
    }
  }
  return null;
}

// POST /api/reviews/agency
router.post('/agency', requireAuth, async (req, res) => {
  const { agency_id, review_text, ...grades } = req.body;

  if (!agency_id) return res.status(400).json({ error: 'agency_id is required' });

  const err = validateGrades(grades, AGENCY_GRADE_FIELDS);
  if (err) return res.status(400).json({ error: err });

  const overall_grade = computeOverallGrade(AGENCY_GRADE_FIELDS.map((f) => grades[f]));

  const { data, error } = await supabaseAdmin
    .from('agency_reviews')
    .insert({
      agency_id,
      user_id: req.user.id,
      grade_communication: grades.grade_communication,
      grade_fairness: grades.grade_fairness,
      grade_accountability: grades.grade_accountability,
      grade_backing_officers: grades.grade_backing_officers,
      grade_morale: grades.grade_morale,
      grade_promotion_fairness: grades.grade_promotion_fairness,
      grade_work_life: grades.grade_work_life,
      grade_toxic_leadership: grades.grade_toxic_leadership,
      overall_grade,
      review_text: review_text?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'You have already reviewed this agency' });
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// POST /api/reviews/supervisor
router.post('/supervisor', requireAuth, async (req, res) => {
  const { supervisor_id, agency_id, review_text, ...grades } = req.body;

  if (!supervisor_id) return res.status(400).json({ error: 'supervisor_id is required' });
  if (!agency_id) return res.status(400).json({ error: 'agency_id is required' });

  const err = validateGrades(grades, SUPERVISOR_GRADE_FIELDS);
  if (err) return res.status(400).json({ error: err });

  const overall_grade = computeOverallGrade(SUPERVISOR_GRADE_FIELDS.map((f) => grades[f]));

  const { data, error } = await supabaseAdmin
    .from('supervisor_reviews')
    .insert({
      supervisor_id,
      agency_id,
      user_id: req.user.id,
      grade_communication: grades.grade_communication,
      grade_fairness: grades.grade_fairness,
      grade_accountability: grades.grade_accountability,
      grade_professionalism: grades.grade_professionalism,
      grade_retaliation: grades.grade_retaliation,
      grade_morale_impact: grades.grade_morale_impact,
      grade_backing_officers: grades.grade_backing_officers,
      grade_promotion_fairness: grades.grade_promotion_fairness,
      grade_assignment_fairness: grades.grade_assignment_fairness,
      overall_grade,
      review_text: review_text?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'You have already reviewed this supervisor' });
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

module.exports = router;
