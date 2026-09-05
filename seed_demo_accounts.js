const pool = require('./server/config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding / updating demo accounts...');
  const hash = await bcrypt.hash('Password123!', 10);

  // 1. student@demo.com
  const [existingStudent] = await pool.query("SELECT id FROM users WHERE email='student@demo.com'");
  let studentId;
  if (!existingStudent.length) {
    const [res] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status, phone)
       VALUES ('Aarav Patel', 'student@demo.com', ?, 'student', 'active', '+91 9876543210')`,
      [hash]
    );
    studentId = res.insertId;
    console.log('Created student@demo.com with id', studentId);
  } else {
    studentId = existingStudent[0].id;
    await pool.query("UPDATE users SET password_hash=?, status='active' WHERE id=?", [hash, studentId]);
    console.log('Updated student@demo.com with id', studentId);
  }

  // Ensure student profile
  await pool.query(
    `INSERT INTO student_profiles (user_id, headline, bio, college, branch, current_year, semester, cgpa, graduation_year, district, state, employment_status)
     VALUES (?, 'Aspiring Full Stack Engineer', 'Passionate about modern web systems, Node.js, and cloud APIs.', 'Government Polytechnic Pune', 'Computer Engineering', 'Final Year', 'Semester 6', '8.9', 2026, 'Pune', 'Maharashtra', 'seeking')
     ON DUPLICATE KEY UPDATE headline=VALUES(headline), bio=VALUES(bio), college=VALUES(college), district=VALUES(district), employment_status=VALUES(employment_status)`,
    [studentId]
  );

  // Give student some skills (React, JavaScript, HTML, CSS, Git)
  const [skills] = await pool.query("SELECT id, name FROM skills WHERE name IN ('React', 'JavaScript', 'HTML', 'CSS', 'Git', 'Node.js')");
  for (const s of skills) {
    await pool.query("INSERT IGNORE INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, 'intermediate')", [studentId, s.id]);
  }

  // 2. Also ensure rahul@demo.com password is Password123! and active
  await pool.query("UPDATE users SET password_hash=?, status='active' WHERE email='rahul@demo.com'", [hash]);

  // 3. institute@demo.com
  await pool.query("UPDATE users SET password_hash=?, status='active' WHERE email='institute@demo.com'", [hash]);

  // 4. industry@demo.com
  await pool.query("UPDATE users SET password_hash=?, status='active' WHERE email='industry@demo.com'", [hash]);

  // 5. gov@demo.com
  await pool.query("UPDATE users SET password_hash=?, status='active' WHERE email='gov@demo.com'", [hash]);

  // 6. Ensure at least one course exists
  const [courses] = await pool.query("SELECT id FROM courses LIMIT 1");
  if (!courses.length) {
    await pool.query(
      `INSERT INTO courses (title, description, provider, instructor, category, skills_covered, difficulty, duration_weeks, district, state, status)
       VALUES ('Full Stack Web Architecture', 'Master front-end and back-end web development with React, Node.js, and SQL databases.', 'SkillTrack State Academy', 'Prof. Arvind Joshi', 'Technical', 'React, Node.js, SQL, JavaScript', 'intermediate', 12, 'Pune', 'Maharashtra', 'published')`
    );
  }

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
