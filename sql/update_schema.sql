-- ============================================================
-- SkillBridge Database Migration
-- Safe & idempotent schema updates
-- ============================================================

USE skillbridge;

-- 1. Course Lessons Table
CREATE TABLE IF NOT EXISTS course_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  lesson_order INT DEFAULT 1,
  content_type ENUM('video', 'document', 'text', 'link') DEFAULT 'text',
  content_url VARCHAR(255) NULL,
  content_text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 2. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  skills_required VARCHAR(255),
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  deadline DATE NULL,
  attachment_url VARCHAR(255) NULL,
  status ENUM('draft', 'published', 'closed') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_text TEXT,
  repo_url VARCHAR(255) NULL,
  file_url VARCHAR(255) NULL,
  status ENUM('submitted', 'reviewed', 'accepted', 'rejected') DEFAULT 'submitted',
  feedback TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_submission (assignment_id, student_id)
);

-- 4. Course Quizzes Table
CREATE TABLE IF NOT EXISTS course_quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  passing_score INT DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
  points INT DEFAULT 1,
  FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE
);

-- 6. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  score_percent INT NOT NULL,
  passed BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Longitudinal Employment Tracking (SIH26135)
-- Run safe column additions:
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS milestone_days INT DEFAULT 30;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS outcome_type ENUM('employed', 'self_employed', 'apprenticeship', 'seeking', 'higher_education') DEFAULT 'employed';
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS monthly_salary INT NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS employer_name VARCHAR(200) NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS location_district VARCHAR(100) NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS verification_level ENUM('self_reported', 'institute_verified', 'employer_verified') DEFAULT 'self_reported';
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS verified_by_user_id INT NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS unemployment_reason VARCHAR(100) NULL;
-- ALTER TABLE employment_records ADD COLUMN IF NOT EXISTS unemployment_notes TEXT NULL;

-- 8. Institutes Master Table
CREATE TABLE IF NOT EXISTS institutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  code VARCHAR(50) NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Maharashtra',
  accreditation VARCHAR(100) DEFAULT 'State Accredited / DTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

