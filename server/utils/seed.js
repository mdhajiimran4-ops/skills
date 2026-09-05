/**
 * Creates one demo login for each role so you can explore the app instantly.
 * Run AFTER importing schema.sql:   npm run seed
 * All demo accounts use the password: Password123!
 */
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const DEMO_PASSWORD = 'Password123!';

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoUsers = [
    { name: 'Asha Reddy', email: 'student@demo.com', role: 'student', status: 'active' },
    { name: 'BuildTech Pvt Ltd', email: 'industry@demo.com', role: 'industry', status: 'active' },
    { name: 'Ravi Kumar (Recruiter)', email: 'employee@demo.com', role: 'employee', status: 'active' },
    { name: 'District Skill Officer', email: 'gov@demo.com', role: 'government', status: 'active' },
    { name: 'Impact Ventures', email: 'investor@demo.com', role: 'investor', status: 'active' }
  ];

  for (const u of demoUsers) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length) {
      console.log(`Skip (exists): ${u.email}`);
      continue;
    }
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?,?,?,?,?)',
      [u.name, u.email, hash, u.role, u.status]
    );
    const userId = result.insertId;

    if (u.role === 'student') {
      await pool.query(
        'INSERT INTO student_profiles (user_id, headline, bio, district, state, linkedin_url, github_url, employment_status) VALUES (?,?,?,?,?,?,?,?)',
        [userId, 'Aspiring Full Stack Developer', 'Learning MERN stack and MySQL. Passionate about building real products.', 'Hyderabad', 'Telangana', 'https://linkedin.com/in/ashareddy', 'https://github.com/ashareddy', 'training']
      );
      await pool.query('INSERT INTO student_skills (student_id, skill_id, proficiency, verified) VALUES (?,?,?,?)', [userId, 1, 'advanced', true]);
      await pool.query('INSERT INTO student_skills (student_id, skill_id, proficiency, verified) VALUES (?,?,?,?)', [userId, 2, 'advanced', true]);
      await pool.query('INSERT INTO student_skills (student_id, skill_id, proficiency, verified) VALUES (?,?,?,?)', [userId, 3, 'intermediate', false]);
      await pool.query('INSERT INTO enrollments (student_id, course_id, progress_percent, status) VALUES (?,?,?,?)', [userId, 1, 65, 'in_progress']);
    }

    if (u.role === 'industry') {
      await pool.query(
        'INSERT INTO companies (user_id, company_name, industry_sector, description, website, district, state) VALUES (?,?,?,?,?,?,?)',
        [userId, 'BuildTech Pvt Ltd', 'Software Services', 'A growing software company hiring entry-level developers and offering internships.', 'https://buildtech.example.com', 'Hyderabad', 'Telangana']
      );
      const [jobResult] = await pool.query(
        'INSERT INTO jobs (company_id, title, description, job_type, location, district, state, status) VALUES (?,?,?,?,?,?,?,?)',
        [userId, 'Junior Full Stack Developer', 'Work on real client projects using the MERN stack and MySQL.', 'job', 'Hyderabad', 'Hyderabad', 'Telangana', 'open']
      );
      const jobId = jobResult.insertId;
      await pool.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [jobId, 1, 'intermediate']);
      await pool.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [jobId, 3, 'advanced']);
      await pool.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [jobId, 5, 'intermediate']);
      await pool.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [jobId, 7, 'beginner']);
    }

    if (u.role === 'employee') {
      const [companyRows] = await pool.query("SELECT user_id FROM companies LIMIT 1");
      if (companyRows.length) {
        await pool.query('INSERT INTO employees (user_id, company_id, job_title) VALUES (?,?,?)', [userId, companyRows[0].user_id, 'HR Recruiter']);
      }
    }

    console.log(`Created: ${u.email} / password: ${DEMO_PASSWORD}`);
  }

  console.log('\nSeeding complete. Demo password for all accounts: ' + DEMO_PASSWORD);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
