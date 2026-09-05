/**
 * SIH26135 Canonical Seed Script
 * ------------------------------
 * Seeds rich demonstration data for Smart India Hackathon:
 * 1. Accredited Institutes across key industrial districts
 * 2. Rahul's 4-milestone longitudinal journey (30d -> 90d -> 180d -> 365d)
 * 3. Multi-district cohorts with varied outcomes (Employed, Self-Employed, Apprenticeship, Seeking)
 * 4. Multi-level verification (Level 1 Self-Reported, Level 2 Institute Verified, Level 3 Employer Verified)
 * 5. Varied unemployment root causes for policy analysis
 */

const bcrypt = require('bcryptjs');
const pool = require('../server/config/db');

const DEMO_PASSWORD = 'Password123!';

async function seedSIH() {
  console.log('Seeding SIH26135 canonical dataset...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Seed Institutes
  const institutes = [
    { name: 'Government Polytechnic Pune', code: 'GPP-201', district: 'Pune', state: 'Maharashtra', accreditation: 'NBA Accredited / DTE A+' },
    { name: 'COEP Technological University', code: 'COEP-101', district: 'Pune', state: 'Maharashtra', accreditation: 'NAAC A++ / State Lead' },
    { name: 'Veermata Jijabai Technological Institute (VJTI)', code: 'VJTI-102', district: 'Mumbai', state: 'Maharashtra', accreditation: 'Autonomous / NBA Tier-1' },
    { name: 'Government ITI Nagpur', code: 'ITI-NGP-301', district: 'Nagpur', state: 'Maharashtra', accreditation: 'DGT Certified / A+' },
    { name: 'K.K. Wagh Polytechnic & Engineering', code: 'KKW-401', district: 'Nashik', state: 'Maharashtra', accreditation: 'NAAC A+ / State Affiliated' },
    { name: 'Government Polytechnic Thane', code: 'GPT-501', district: 'Thane', state: 'Maharashtra', accreditation: 'State Technical Board / A' },
    { name: 'Government Polytechnic Hyderabad', code: 'GPH-601', district: 'Hyderabad', state: 'Telangana', accreditation: 'SBTET Approved / A+' }
  ];

  for (const inst of institutes) {
    await pool.query(
      `INSERT INTO institutes (name, code, district, state, accreditation)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE code=VALUES(code), district=VALUES(district), state=VALUES(state), accreditation=VALUES(accreditation)`,
      [inst.name, inst.code, inst.district, inst.state, inst.accreditation]
    );
  }
  console.log('Institutes seeded.');

  // 2. Ensure extra modern skills exist
  const extraSkills = [
    ['AWS', 'Cloud'],
    ['Docker', 'DevOps'],
    ['Kubernetes', 'DevOps'],
    ['Power BI', 'Data'],
    ['Excel', 'Data'],
    ['Cyber Security', 'Security'],
    ['Node.js', 'Backend'],
    ['React', 'Frontend'],
    ['Python', 'Programming'],
    ['SQL', 'Database'],
    ['Statistics', 'Data'],
    ['UI/UX Design', 'Design']
  ];
  for (const [name, cat] of extraSkills) {
    await pool.query('INSERT IGNORE INTO skills (name, category) VALUES (?,?)', [name, cat]);
  }
  console.log('Extra skills seeded.');

  // 2b. Seed Core Role Demo Accounts (Industry, Government, Institute/Faculty)
  const roleAccounts = [
    { name: 'BuildTech Solutions', email: 'industry@demo.com', role: 'industry', status: 'active', phone: '+91 98220 12345' },
    { name: 'District Skill Development Officer', email: 'gov@demo.com', role: 'government', status: 'active', phone: '+91 98220 54321' },
    { name: 'Prof. Arvind Joshi (Faculty Mentor)', email: 'institute@demo.com', role: 'employee', status: 'active', phone: '+91 98220 67890' }
  ];

  let indUserId = null;
  for (const acc of roleAccounts) {
    let uid;
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [acc.email]);
    if (exist.length) {
      uid = exist[0].id;
      await pool.query('UPDATE users SET password_hash=?, status="active" WHERE id=?', [passwordHash, uid]);
    } else {
      const [res] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status, phone) VALUES (?,?,?,?,?,?)',
        [acc.name, acc.email, passwordHash, acc.role, acc.status, acc.phone]
      );
      uid = res.insertId;
    }
    if (acc.role === 'industry') {
      indUserId = uid;
      await pool.query(`
        INSERT INTO companies (user_id, company_name, industry_sector, description, district, state)
        VALUES (?, 'BuildTech Solutions Pvt Ltd', 'Information Technology', 'Leading enterprise cloud & data engineering firm.', 'Pune', 'Maharashtra')
        ON DUPLICATE KEY UPDATE company_name=VALUES(company_name)
      `, [uid]);
    } else if (acc.role === 'employee' && indUserId) {
      await pool.query(`
        INSERT INTO employees (user_id, company_id, job_title)
        VALUES (?, ?, 'Faculty Supervisor & Placement Lead')
        ON DUPLICATE KEY UPDATE job_title=VALUES(job_title)
      `, [uid, indUserId]);
    }
  }
  console.log('Role demo accounts (industry, gov, institute) verified.');

  // 3. Seed canonical student: Rahul Sharma
  let rahulId;
  const [existingRahul] = await pool.query("SELECT id FROM users WHERE email = 'rahul@demo.com'");
  if (existingRahul.length) {
    rahulId = existingRahul[0].id;
  } else {
    const [res] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status, phone, avatar_url) VALUES (?,?,?,?,?,?,?)',
      ['Rahul Sharma', 'rahul@demo.com', passwordHash, 'student', 'active', '+91 98231 45091', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150']
    );
    rahulId = res.insertId;
  }

  await pool.query(
    `INSERT INTO student_profiles (
      user_id, headline, bio, district, state, phone, college, branch, current_year,
      semester, cgpa, graduation_year, college_id, linkedin_url, github_url, portfolio_url,
      employment_status, experience, preferred_jobs
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      headline=VALUES(headline), bio=VALUES(bio), district=VALUES(district), state=VALUES(state),
      college=VALUES(college), branch=VALUES(branch), cgpa=VALUES(cgpa), experience=VALUES(experience),
      preferred_jobs=VALUES(preferred_jobs)`,
    [
      rahulId,
      'Data Analytics Trainee • Python, SQL, Power BI',
      'Passionate about translating raw transactional datasets into predictive dashboards. Completed State Accredited Data Analytics Program.',
      'Pune', 'Maharashtra', '+91 98231 45091',
      'Government Polytechnic Pune', 'Computer Engineering', 'Final Year',
      'Semester 6', '8.7', 2025, 'GPP-CS-2022-89',
      'https://linkedin.com/in/rahul-sharma-data', 'https://github.com/rahul-data-pulse', 'https://rahulsharma.dev',
      'employed',
      'Completed 6-month industrial apprenticeship at DataTech Solutions focusing on ETL pipelines and Power BI reporting.',
      'Data Analyst, Business Intelligence Specialist, Junior Analytics Engineer'
    ]
  );

  // Link skills for Rahul (Python, SQL, Excel, Power BI)
  const [skillRows] = await pool.query("SELECT id, name FROM skills WHERE name IN ('Python','SQL','Excel','Power BI','Statistics')");
  for (const s of skillRows) {
    await pool.query(
      'INSERT INTO student_skills (student_id, skill_id, proficiency, verified) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE proficiency=VALUES(proficiency), verified=VALUES(verified)',
      [rahulId, s.id, 'advanced', true]
    );
  }

  // Rahul's 4 Longitudinal Milestones
  await pool.query('DELETE FROM employment_records WHERE student_id = ?', [rahulId]);

  // Milestone 1 (30 Days): Seeking / Unemployed with root-cause feedback
  await pool.query(
    `INSERT INTO employment_records
    (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, unemployment_reason, unemployment_notes, start_date, recorded_at)
    VALUES (?, ?, 'unemployed', 'seeking', 30, NULL, NULL, 'Pune', 'self_reported', 'interview_difficulty',
    'Attended 3 technical interviews. Struggled with live presentation of analytical dashboards and business case questions.', DATE_SUB(CURDATE(), INTERVAL 335 DAY), DATE_SUB(NOW(), INTERVAL 335 DAY))`,
    [rahulId, 'Seeking Data Analyst Role']
  );

  // Milestone 2 (90 Days): Employed at DataTech Solutions, ₹25,000/mo (Level 2 Institute Verified)
  await pool.query(
    `INSERT INTO employment_records
    (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, start_date, recorded_at)
    VALUES (?, 'Junior Data Analyst', 'employed', 'employed', 90, 25000, 'DataTech Solutions Pvt Ltd', 'Pune', 'institute_verified',
    DATE_SUB(CURDATE(), INTERVAL 275 DAY), DATE_SUB(NOW(), INTERVAL 275 DAY))`,
    [rahulId]
  );

  // Milestone 3 (180 Days): Retention Confirmed, ₹25,000/mo (Level 3 Employer Verified)
  await pool.query(
    `INSERT INTO employment_records
    (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, follow_up_notes, start_date, recorded_at)
    VALUES (?, 'Junior Data Analyst', 'employed', 'employed', 180, 25000, 'DataTech Solutions Pvt Ltd', 'Pune', 'employer_verified',
    'Completed probation successfully. Transitioned into core SQL data warehousing team.',
    DATE_SUB(CURDATE(), INTERVAL 185 DAY), DATE_SUB(NOW(), INTERVAL 185 DAY))`,
    [rahulId]
  );

  // Milestone 4 (365 Days): Promoted / Switched, ₹34,000/mo (Level 3 Employer Verified - Salary Progression & 1-Year Retention!)
  await pool.query(
    `INSERT INTO employment_records
    (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, follow_up_notes, start_date, recorded_at)
    VALUES (?, 'Mid-Level Analytics Engineer', 'employed', 'employed', 365, 34000, 'CloudScale Technologies', 'Pune', 'employer_verified',
    'Promoted to Mid-Level. Successfully leading automated client ETL jobs. +36% salary progression over baseline.',
    DATE_SUB(CURDATE(), INTERVAL 5 DAY), NOW())`,
    [rahulId]
  );

  console.log("Rahul's 4-milestone longitudinal trajectory seeded.");

  // 4. Seed other student cohorts across districts (Pune, Nagpur, Nashik, Thane, Hyderabad)
  const cohortData = [
    {
      name: 'Ayesha Khan', email: 'ayesha.k@demo.com', district: 'Thane', college: 'Government Polytechnic Thane',
      role: 'Cyber-Physical Systems Lead', status: 'employed', outcome: 'employed', salary: 31000, days: 365,
      company: 'Siemens Industrial Automation', level: 'employer_verified'
    },
    {
      name: 'Rohit Patil', email: 'rohit.p@demo.com', district: 'Pune', college: 'COEP Technological University',
      role: 'Cloud DevOps Associate', status: 'employed', outcome: 'employed', salary: 28000, days: 180,
      company: 'Apex Cloud Systems', level: 'employer_verified'
    },
    {
      name: 'Sneha Kulkarni', email: 'sneha.k@demo.com', district: 'Nashik', college: 'K.K. Wagh Polytechnic & Engineering',
      role: 'Full Stack React Engineer', status: 'employed', outcome: 'employed', salary: 26000, days: 90,
      company: 'InnoTech Solutions', level: 'institute_verified'
    },
    {
      name: 'Tanmay Deshmukh', email: 'tanmay.d@demo.com', district: 'Nagpur', college: 'Government ITI Nagpur',
      role: 'Industrial IoT Technician', status: 'employed', outcome: 'apprenticeship', salary: 18500, days: 180,
      company: 'Mahindra Heavy Engineering', level: 'institute_verified'
    },
    {
      name: 'Pooja Jadhav', email: 'pooja.j@demo.com', district: 'Pune', college: 'Government Polytechnic Pune',
      role: 'Independent BI Consultant', status: 'employed', outcome: 'self_employed', salary: 35000, days: 365,
      company: 'Pooja Analytics Studio', level: 'self_reported'
    },
    {
      name: 'Vikram Joshi', email: 'vikram.j@demo.com', district: 'Thane', college: 'Government Polytechnic Thane',
      role: 'Seeking Full-Stack Role', status: 'unemployed', outcome: 'seeking', salary: null, days: 90,
      company: null, level: 'self_reported', reason: 'lack_of_skills', notes: 'Industry requires Docker and AWS, but curriculum only covered HTML/CSS/PHP.'
    },
    {
      name: 'Aniket Shinde', email: 'aniket.s@demo.com', district: 'Nagpur', college: 'Government ITI Nagpur',
      role: 'Seeking Mechanical Role', status: 'unemployed', outcome: 'seeking', salary: null, days: 30,
      company: null, level: 'self_reported', reason: 'location', notes: 'All open manufacturing positions require relocation to Pune or Aurangabad.'
    },
    {
      name: 'Priyanka Rane', email: 'priyanka.r@demo.com', district: 'Nashik', college: 'K.K. Wagh Polytechnic & Engineering',
      role: 'Graduate Studies Trainee', status: 'unemployed', outcome: 'higher_education', salary: null, days: 180,
      company: null, level: 'institute_verified'
    }
  ];

  for (const c of cohortData) {
    let uid;
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [c.email]);
    if (exist.length) {
      uid = exist[0].id;
    } else {
      const [uRes] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, status, phone) VALUES (?,?,?,?,?,?)',
        [c.name, c.email, passwordHash, 'student', 'active', '+91 97' + Math.floor(10000000 + Math.random() * 90000000)]
      );
      uid = uRes.insertId;
    }

    await pool.query(
      `INSERT INTO student_profiles (user_id, headline, district, state, college, employment_status)
      VALUES (?, ?, ?, 'Maharashtra', ?, ?)
      ON DUPLICATE KEY UPDATE district=VALUES(district), college=VALUES(college), employment_status=VALUES(employment_status)`,
      [uid, c.role, c.district, c.college, c.status]
    );

    const [hasRec] = await pool.query('SELECT id FROM employment_records WHERE student_id=? AND milestone_days=?', [uid, c.days]);
    if (!hasRec.length) {
      await pool.query(
        `INSERT INTO employment_records
        (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, unemployment_reason, unemployment_notes, start_date, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? DAY), NOW())`,
        [uid, c.role, c.status, c.outcome, c.days, c.salary, c.company, c.district, c.level, c.reason || null, c.notes || null, c.days]
      );
    }
  }

  // 5. Seed diverse Jobs with required skills to generate realistic Industry Demand Data
  const [compRows] = await pool.query("SELECT user_id FROM companies LIMIT 1");
  const companyId = compRows.length ? compRows[0].user_id : 2;

  const sampleJobs = [
    { title: 'Cloud Infrastructure Engineer', district: 'Pune', skills: ['AWS', 'Docker', 'Python', 'SQL'] },
    { title: 'DevOps & CI/CD Specialist', district: 'Pune', skills: ['AWS', 'Docker', 'Kubernetes'] },
    { title: 'Full Stack JavaScript Engineer', district: 'Thane', skills: ['React', 'Node.js', 'MongoDB', 'AWS'] },
    { title: 'Senior React Developer', district: 'Mumbai', skills: ['React', 'JavaScript', 'HTML', 'CSS'] },
    { title: 'Data Analytics Engineer', district: 'Pune', skills: ['Python', 'SQL', 'Power BI', 'Statistics'] },
    { title: 'Industrial Cybersecurity Analyst', district: 'Nagpur', skills: ['Cyber Security', 'Python', 'SQL'] }
  ];

  for (const j of sampleJobs) {
    const [existJob] = await pool.query('SELECT id FROM jobs WHERE title = ?', [j.title]);
    let jId;
    if (existJob.length) {
      jId = existJob[0].id;
    } else {
      const [jRes] = await pool.query(
        `INSERT INTO jobs (company_id, title, description, job_type, location, district, state, status)
        VALUES (?, ?, 'High-growth role with structured mentorship and post-training retention support.', 'job', ?, ?, 'Maharashtra', 'open')`,
        [companyId, j.title, j.district, j.district]
      );
      jId = jRes.insertId;
    }

    for (const skName of j.skills) {
      const [skR] = await pool.query('SELECT id FROM skills WHERE name = ?', [skName]);
      if (skR.length) {
        await pool.query('INSERT IGNORE INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [jId, skR[0].id, 'intermediate']);
      }
    }
  }

  console.log('Jobs and industry skills seeded.');
  console.log('SIH26135 dataset successfully seeded!');
  process.exit(0);
}

seedSIH().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
