-- ============================================================
-- SkillBridge Database Schema
-- Run: mysql -u root -p < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS skillbridge CHARACTER SET utf8mb4;
USE skillbridge;

-- ---------- Core users table (all roles) ----------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,          -- null if Google-only account
  google_id VARCHAR(100) NULL UNIQUE,
  role ENUM('student','industry','employee','government','investor') NOT NULL,
  status ENUM('active','pending','rejected','banned') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Student profile (LinkedIn/GitHub-style) ----------
CREATE TABLE student_profiles (
  user_id INT PRIMARY KEY,
  headline VARCHAR(200),
  bio TEXT,
  district VARCHAR(100),
  state VARCHAR(100),
  phone VARCHAR(25),
  college VARCHAR(200),
  branch VARCHAR(150),
  current_year VARCHAR(20),
  semester VARCHAR(20),
  cgpa VARCHAR(10),
  graduation_year INT,
  college_id VARCHAR(50),
  portfolio_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  resume_url VARCHAR(255),
  avatar_url VARCHAR(255),
  employment_status ENUM('seeking','training','employed','unemployed') DEFAULT 'seeking',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- Skills master list ----------
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100)
);

CREATE TABLE student_skills (
  student_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency ENUM('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ---------- Companies (industry role profile) ----------
CREATE TABLE companies (
  user_id INT PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  industry_sector VARCHAR(150),
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(255),
  contact_email VARCHAR(190),
  contact_phone VARCHAR(25),
  linkedin_url VARCHAR(255),
  district VARCHAR(100),
  state VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Employees belong to a company (posted by / managed under a company account)
CREATE TABLE employees (
  user_id INT PRIMARY KEY,
  company_id INT NOT NULL,
  job_title VARCHAR(150),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- Training programs / courses ----------
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  provider VARCHAR(150),
  instructor VARCHAR(150),
  category VARCHAR(100),
  skills_covered VARCHAR(255),
  difficulty ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  duration_weeks INT,
  district VARCHAR(100),
  state VARCHAR(100),
  thumbnail_url VARCHAR(255),
  status ENUM('draft','published') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE course_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  lesson_order INT DEFAULT 1,
  content_type ENUM('video', 'document', 'text', 'link') DEFAULT 'text',
  content_url VARCHAR(255),
  content_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE course_skills (
  course_id INT NOT NULL,
  skill_id INT NOT NULL,
  PRIMARY KEY (course_id, skill_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percent INT DEFAULT 0,
  status ENUM('enrolled','in_progress','completed','dropped') DEFAULT 'enrolled',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ---------- Certificates ----------
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NULL,
  issued_by VARCHAR(200) NOT NULL,        -- company or training body name
  issuing_company_id INT NULL,            -- if issued by a company (industry user)
  title VARCHAR(200) NOT NULL,
  issue_date DATE NOT NULL,
  certificate_url VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (issuing_company_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------- Student projects (portfolio, "kit building and selling" etc.) ----------
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tech_stack VARCHAR(255),
  project_url VARCHAR(255),
  repo_url VARCHAR(255),
  image_url VARCHAR(255),
  status ENUM('in_progress', 'completed') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- Industry Assignments & Student Submissions ----------
CREATE TABLE assignments (
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

CREATE TABLE assignment_submissions (
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

-- ---------- Jobs / internships posted by companies ----------
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  job_type ENUM('job','internship','training') DEFAULT 'job',
  location VARCHAR(150),
  district VARCHAR(100),
  state VARCHAR(100),
  status ENUM('open','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE job_skills (
  job_id INT NOT NULL,
  skill_id INT NOT NULL,
  required_proficiency ENUM('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  PRIMARY KEY (job_id, skill_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ---------- Applications & matching ----------
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  student_id INT NOT NULL,
  match_score INT DEFAULT 0,               -- AI-computed skill match %
  status ENUM('applied','shortlisted','interview','offered','rejected','hired') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, student_id)
);

-- ---------- Employment / follow-up outcomes (SIH26135 Longitudinal Tracking) ----------
CREATE TABLE employment_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  company_id INT NULL,
  job_title VARCHAR(200),
  status ENUM('employed','unemployed','self_employed','higher_education') DEFAULT 'employed',
  outcome_type ENUM('employed','self_employed','apprenticeship','seeking','higher_education') DEFAULT 'employed',
  milestone_days INT DEFAULT 30,
  monthly_salary INT NULL,
  salary_range VARCHAR(100),
  employer_name VARCHAR(200) NULL,
  location_district VARCHAR(100) NULL,
  verification_level ENUM('self_reported','institute_verified','employer_verified') DEFAULT 'self_reported',
  verified_by_user_id INT NULL,
  verified_at TIMESTAMP NULL,
  unemployment_reason VARCHAR(100) NULL,
  unemployment_notes TEXT NULL,
  start_date DATE,
  end_date DATE NULL,
  follow_up_notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------- Institutes master table for college/vocational center performance tracking ----------
CREATE TABLE institutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE,
  code VARCHAR(50) NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) DEFAULT 'Maharashtra',
  accreditation VARCHAR(100) DEFAULT 'State Accredited / DTE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------- Government moderation actions ----------
CREATE TABLE gov_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gov_user_id INT NOT NULL,
  target_type ENUM('student','company') NOT NULL,
  target_id INT NOT NULL,
  action ENUM('approve','reject','ban','unban') NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gov_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed data (dummy/demo data so the app is usable immediately)
-- ============================================================

INSERT INTO skills (name, category) VALUES
('HTML','Frontend'),('CSS','Frontend'),('JavaScript','Frontend'),
('React','Frontend'),('Node.js','Backend'),('Express','Backend'),
('MySQL','Database'),('MongoDB','Database'),('Python','Programming'),
('Data Analysis','Data'),('Machine Learning','Data'),('Java','Programming'),
('Communication','Soft Skill'),('Project Management','Soft Skill'),
('Digital Marketing','Marketing'),('Electrical Wiring','Vocational'),
('Welding','Vocational'),('Tally/Accounting','Finance');

-- Demo password for ALL seed accounts below = "Password123!"
-- (bcrypt hash generated at seed time by server/utils/seed.js — see README)

INSERT INTO courses (title, description, provider, duration_weeks, district, state) VALUES
('Full Stack Web Development', 'HTML, CSS, JS, Node.js, MySQL end-to-end training', 'SkillBridge Academy', 12, 'Hyderabad', 'Telangana'),
('Data Analytics Fundamentals', 'Excel, SQL, Python for data analysis', 'SkillBridge Academy', 8, 'Warangal', 'Telangana'),
('Industrial Electrical Skills', 'Hands-on electrical wiring and safety', 'Skill Development Board', 6, 'Hyderabad', 'Telangana');

INSERT INTO course_skills (course_id, skill_id) VALUES
(1,1),(1,2),(1,3),(1,5),(1,6),(1,7),
(2,7),(2,9),(2,10),
(3,16);

select * from users;
