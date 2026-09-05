const pool = require('../server/config/db');

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function addColumnIfNotExists(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    console.log(`Adding column ${column} to ${table}...`);
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  } else {
    console.log(`Column ${column} already exists in ${table}.`);
  }
}

async function migrate() {
  console.log('Starting migration...');

  // 1. users table: phone and avatar_url for universal role DP and login
  await addColumnIfNotExists('users', 'phone', 'VARCHAR(25) NULL');
  await addColumnIfNotExists('users', 'avatar_url', 'VARCHAR(255) NULL');

  // 2. student_profiles
  await addColumnIfNotExists('student_profiles', 'phone', 'VARCHAR(25) NULL');
  await addColumnIfNotExists('student_profiles', 'college', 'VARCHAR(200) NULL');
  await addColumnIfNotExists('student_profiles', 'branch', 'VARCHAR(150) NULL');
  await addColumnIfNotExists('student_profiles', 'current_year', 'VARCHAR(20) NULL');
  await addColumnIfNotExists('student_profiles', 'semester', 'VARCHAR(20) NULL');
  await addColumnIfNotExists('student_profiles', 'cgpa', 'VARCHAR(10) NULL');
  await addColumnIfNotExists('student_profiles', 'graduation_year', 'INT NULL');
  await addColumnIfNotExists('student_profiles', 'college_id', 'VARCHAR(50) NULL');
  await addColumnIfNotExists('student_profiles', 'portfolio_url', 'VARCHAR(255) NULL');
  await addColumnIfNotExists('student_profiles', 'experience', 'TEXT NULL');
  await addColumnIfNotExists('student_profiles', 'preferred_jobs', 'VARCHAR(255) NULL');

  // 3. projects
  await addColumnIfNotExists('projects', 'image_url', 'VARCHAR(255) NULL');
  await addColumnIfNotExists('projects', 'status', "ENUM('in_progress', 'completed') DEFAULT 'completed'");

  // 4. companies
  await addColumnIfNotExists('companies', 'contact_email', 'VARCHAR(190) NULL');
  await addColumnIfNotExists('companies', 'contact_phone', 'VARCHAR(25) NULL');
  await addColumnIfNotExists('companies', 'linkedin_url', 'VARCHAR(255) NULL');

  // 5. courses
  await addColumnIfNotExists('courses', 'company_id', 'INT NULL');
  await addColumnIfNotExists('courses', 'instructor', 'VARCHAR(150) NULL');
  await addColumnIfNotExists('courses', 'category', 'VARCHAR(100) NULL');
  await addColumnIfNotExists('courses', 'skills_covered', 'VARCHAR(255) NULL');
  await addColumnIfNotExists('courses', 'difficulty', "ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner'");
  await addColumnIfNotExists('courses', 'thumbnail_url', 'VARCHAR(255) NULL');
  await addColumnIfNotExists('courses', 'status', "ENUM('draft', 'published') DEFAULT 'published'");

  // 6. applications (Interview scheduling lifecycle)
  await addColumnIfNotExists('applications', 'interview_date', 'DATETIME NULL');
  await addColumnIfNotExists('applications', 'interview_mode', "ENUM('online', 'in_person', 'phone') DEFAULT 'online'");
  await addColumnIfNotExists('applications', 'interview_link', 'VARCHAR(255) NULL');
  await addColumnIfNotExists('applications', 'interview_notes', 'TEXT NULL');

  // 7. Course Lessons table
  await pool.query(`
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
    )
  `);
  console.log('course_lessons table verified.');

  // 8. Assignments table
  await pool.query(`
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
    )
  `);
  console.log('assignments table verified.');

  // 9. Assignment Submissions table
  await pool.query(`
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
    )
  `);
  console.log('assignment_submissions table verified.');

  // 10. Course Quizzes table (Company MCQ Assessments)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS course_quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      passing_score INT DEFAULT 60,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);
  console.log('course_quizzes table verified.');

  // 11. Quiz Questions table (MCQs with options A-D and correct option)
  await pool.query(`
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
    )
  `);
  console.log('quiz_questions table verified.');

  // 12. Quiz Attempts table (Scores & Pass/Fail status)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      student_id INT NOT NULL,
      score_percent INT NOT NULL,
      passed BOOLEAN DEFAULT FALSE,
      attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('quiz_attempts table verified.');

  // 13. Longitudinal Employment & Follow-up tracking (SIH26135)
  await addColumnIfNotExists('employment_records', 'milestone_days', 'INT DEFAULT 30');
  await addColumnIfNotExists('employment_records', 'outcome_type', "ENUM('employed', 'self_employed', 'apprenticeship', 'seeking', 'higher_education') DEFAULT 'employed'");
  await addColumnIfNotExists('employment_records', 'monthly_salary', 'INT NULL');
  await addColumnIfNotExists('employment_records', 'employer_name', 'VARCHAR(200) NULL');
  await addColumnIfNotExists('employment_records', 'location_district', 'VARCHAR(100) NULL');
  await addColumnIfNotExists('employment_records', 'verification_level', "ENUM('self_reported', 'institute_verified', 'employer_verified') DEFAULT 'self_reported'");
  await addColumnIfNotExists('employment_records', 'verified_by_user_id', 'INT NULL');
  await addColumnIfNotExists('employment_records', 'verified_at', 'TIMESTAMP NULL');
  await addColumnIfNotExists('employment_records', 'unemployment_reason', 'VARCHAR(100) NULL');
  await addColumnIfNotExists('employment_records', 'unemployment_notes', 'TEXT NULL');

  // 15. Expand users.role to include 'institute'
  try {
    await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('student','industry','employee','government','investor','institute') NOT NULL DEFAULT 'student'`);
    console.log('users.role enum updated to include institute.');
  } catch (err) {
    console.log('users.role enum update note:', err.message);
  }

  // 16. Attendance Table for Training Institutes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      student_id INT NOT NULL,
      session_date DATE NOT NULL,
      status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
      notes VARCHAR(255) NULL,
      marked_by_user_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_attendance (course_id, student_id, session_date)
    )
  `);
  console.log('attendance table verified.');

  // 17. Notifications Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      link_url VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('notifications table verified.');

  // 18. Password Resets Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(100) NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('password_resets table verified.');

  // 19. Ensure courses has institute_id
  await addColumnIfNotExists('courses', 'institute_id', 'INT NULL');

  // 20. Ensure key demo accounts are active and unbanned
  await pool.query(`UPDATE users SET status='active' WHERE email IN ('student@demo.com', 'rahul@demo.com', 'industry@demo.com', 'gov@demo.com', 'institute@demo.com', 'employee@demo.com')`);
  console.log('Core demo accounts verified active.');

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
