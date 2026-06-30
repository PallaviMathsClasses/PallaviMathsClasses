-- Enable pgvector (for future AI features)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS batches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  class_name  TEXT NOT NULL, -- '9th', '10th', '11th', '12th'
  timing      TEXT,          -- e.g. '7:00 AM - 8:30 AM'
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  class_name  TEXT NOT NULL,
  batch_id    UUID REFERENCES batches(id) ON DELETE SET NULL,
  parent_name TEXT,
  phone       TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  public_slug TEXT UNIQUE DEFAULT lower(replace(uuid_generate_v4()::text, '-', '')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch_id    UUID REFERENCES batches(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  present     BOOLEAN NOT NULL DEFAULT true,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date)
);

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name    TEXT NOT NULL,
  test_date    DATE NOT NULL,
  class_name   TEXT NOT NULL,
  batch_id     UUID REFERENCES batches(id) ON DELETE SET NULL,
  max_marks    NUMERIC(6,2) NOT NULL DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  public_slug  TEXT UNIQUE DEFAULT lower(replace(uuid_generate_v4()::text, '-', '')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EXAM RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id        UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(6,2),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

-- ============================================
-- DEVICE SESSIONS TABLE (remember device)
-- ============================================
CREATE TABLE IF NOT EXISTS device_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_hash  TEXT NOT NULL UNIQUE,
  user_email   TEXT NOT NULL,
  last_seen    TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for published exams
CREATE POLICY "Public can read published exams"
  ON exams FOR SELECT USING (is_published = true);

-- Public read for exam results (of published exams)
CREATE POLICY "Public can read results of published exams"
  ON exam_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_results.exam_id AND exams.is_published = true));

-- Public read for students (for student sheet)
CREATE POLICY "Public can read active students"
  ON students FOR SELECT USING (is_active = true);

-- Public read for batches
CREATE POLICY "Public can read batches"
  ON batches FOR SELECT USING (is_active = true);

-- Public read for attendance (for student sheet)
CREATE POLICY "Public can read attendance"
  ON attendance FOR SELECT USING (true);

-- Service role has full access (used by server-side API routes)
CREATE POLICY "Service role full access - students"
  ON students FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - attendance"
  ON attendance FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - exams"
  ON exams FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - exam_results"
  ON exam_results FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - batches"
  ON batches FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - device_sessions"
  ON device_sessions FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_exams_slug ON exams(public_slug);
CREATE INDEX IF NOT EXISTS idx_students_slug ON students(public_slug);

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO batches (name, class_name, timing, sort_order) VALUES
  ('Batch A - Morning', '9th',  '7:00 AM – 8:30 AM', 1),
  ('Batch B - Evening', '9th',  '5:00 PM – 6:30 PM', 2),
  ('Batch A - Morning', '10th', '8:30 AM – 10:00 AM', 3),
  ('Batch B - Evening', '10th', '6:30 PM – 8:00 PM', 4),
  ('Batch A - Morning', '11th', '10:00 AM – 11:30 AM', 5),
  ('Batch B - Evening', '11th', '8:00 PM – 9:30 PM', 6),
  ('Batch A - Morning', '12th', '11:30 AM – 1:00 PM', 7),
  ('Batch B - Evening', '12th', '4:00 PM – 5:30 PM', 8)
ON CONFLICT DO NOTHING;
