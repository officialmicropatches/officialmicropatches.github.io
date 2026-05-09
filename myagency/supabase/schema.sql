-- ============================================================
-- MyAgency Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  type text NOT NULL,
  city text,
  slug text UNIQUE NOT NULL,
  overall_grade text,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text NOT NULL,
  is_public_record boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agency_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  grade_communication text NOT NULL CHECK (grade_communication IN ('A','B','C','D','F')),
  grade_fairness text NOT NULL CHECK (grade_fairness IN ('A','B','C','D','F')),
  grade_accountability text NOT NULL CHECK (grade_accountability IN ('A','B','C','D','F')),
  grade_backing_officers text NOT NULL CHECK (grade_backing_officers IN ('A','B','C','D','F')),
  grade_toxic_behavior text NOT NULL CHECK (grade_toxic_behavior IN ('A','B','C','D','F')),
  grade_promotion_fairness text NOT NULL CHECK (grade_promotion_fairness IN ('A','B','C','D','F')),
  grade_work_life text NOT NULL CHECK (grade_work_life IN ('A','B','C','D','F')),
  grade_morale_impact text NOT NULL CHECK (grade_morale_impact IN ('A','B','C','D','F')),
  overall_grade text NOT NULL CHECK (overall_grade IN ('A','B','C','D','F')),
  review_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

CREATE TABLE IF NOT EXISTS supervisor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rank text NOT NULL CHECK (rank IN ('Sergeant','Lieutenant','Captain','Commander','Deputy Chief','Chief')),
  grade_communication text NOT NULL CHECK (grade_communication IN ('A','B','C','D','F')),
  grade_fairness text NOT NULL CHECK (grade_fairness IN ('A','B','C','D','F')),
  grade_accountability text NOT NULL CHECK (grade_accountability IN ('A','B','C','D','F')),
  grade_backing_officers text NOT NULL CHECK (grade_backing_officers IN ('A','B','C','D','F')),
  grade_toxic_behavior text NOT NULL CHECK (grade_toxic_behavior IN ('A','B','C','D','F')),
  grade_promotion_fairness text NOT NULL CHECK (grade_promotion_fairness IN ('A','B','C','D','F')),
  grade_work_life text NOT NULL CHECK (grade_work_life IN ('A','B','C','D','F')),
  grade_morale_impact text NOT NULL CHECK (grade_morale_impact IN ('A','B','C','D','F')),
  overall_grade text NOT NULL CHECK (overall_grade IN ('A','B','C','D','F')),
  review_text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_flagged boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS question_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_flagged boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('agency_review','supervisor_review','question','reply')),
  content_id uuid NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Agencies: public read, no direct user writes
CREATE POLICY "agencies_public_read" ON agencies FOR SELECT USING (true);

-- Command staff: public read
CREATE POLICY "command_staff_public_read" ON command_staff FOR SELECT USING (true);

-- Users: public read of username, own record write
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_own_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_own_update" ON users FOR UPDATE USING (auth.uid() = id);

-- Agency reviews: public read, own insert, no update (immutable)
CREATE POLICY "agency_reviews_public_read" ON agency_reviews FOR SELECT USING (true);
CREATE POLICY "agency_reviews_own_insert" ON agency_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Supervisor reviews: public read, own insert
CREATE POLICY "supervisor_reviews_public_read" ON supervisor_reviews FOR SELECT USING (true);
CREATE POLICY "supervisor_reviews_own_insert" ON supervisor_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Questions: public read, own insert
CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (true);
CREATE POLICY "questions_own_insert" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Question replies: public read, own insert
CREATE POLICY "question_replies_public_read" ON question_replies FOR SELECT USING (true);
CREATE POLICY "question_replies_own_insert" ON question_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flags: authenticated insert only
CREATE POLICY "flags_own_insert" ON flags FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

-- ============================================================
-- FUNCTION: update agency review_count and overall_grade
-- ============================================================

CREATE OR REPLACE FUNCTION update_agency_stats()
RETURNS TRIGGER AS $$
DECLARE
  grade_val numeric;
  avg_val numeric;
  computed_grade text;
  total_reviews integer;
BEGIN
  -- Recompute review_count
  SELECT COUNT(*) INTO total_reviews
  FROM agency_reviews
  WHERE agency_id = NEW.agency_id;

  -- Recompute overall_grade from all reviews
  SELECT AVG(
    CASE overall_grade
      WHEN 'A' THEN 4
      WHEN 'B' THEN 3
      WHEN 'C' THEN 2
      WHEN 'D' THEN 1
      WHEN 'F' THEN 0
    END
  ) INTO avg_val
  FROM agency_reviews
  WHERE agency_id = NEW.agency_id;

  IF avg_val >= 3.5 THEN computed_grade := 'A';
  ELSIF avg_val >= 2.5 THEN computed_grade := 'B';
  ELSIF avg_val >= 1.5 THEN computed_grade := 'C';
  ELSIF avg_val >= 0.5 THEN computed_grade := 'D';
  ELSE computed_grade := 'F';
  END IF;

  UPDATE agencies
  SET review_count = total_reviews,
      overall_grade = computed_grade
  WHERE id = NEW.agency_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER agency_review_stats_trigger
AFTER INSERT ON agency_reviews
FOR EACH ROW EXECUTE FUNCTION update_agency_stats();
