const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { analyzeSkillGap } = require('../utils/aiEngine');

const router = express.Router();
router.use(requireAuth);
const requireCompanyRole = requireRole('industry', 'employer', 'employee', 'admin', 'government');

// resolve the effective company_id: industry/employer user IS the company; employee belongs TO one
async function getCompanyId(user) {
  if (!user) return 1;
  if (user.role === 'industry' || user.role === 'employer') return user.id;
  if (user.role === 'employee') {
    const [rows] = await pool.query('SELECT company_id FROM employees WHERE user_id = ?', [user.id]);
    if (rows[0] && rows[0].company_id) return rows[0].company_id;
    const [comp] = await pool.query('SELECT user_id FROM companies WHERE user_id = ?', [user.id]);
    if (comp[0]) return comp[0].user_id;
  }
  const [anyComp] = await pool.query('SELECT user_id FROM companies LIMIT 1');
  return anyComp[0] ? anyComp[0].user_id : user.id;
}

// ---------- Company profile ----------
router.get('/profile', async (req, res) => {
  const companyId = await getCompanyId(req.user);
  const [rows] = await pool.query('SELECT * FROM companies WHERE user_id = ?', [companyId]);
  res.json({ company: rows[0] || {} });
});

router.put('/profile', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const {
      company_name, industry_sector, description, website,
      logo_url, contact_email, contact_phone, linkedin_url, district, state
    } = req.body;

    if (company_name && company_name.trim()) {
      await pool.query('UPDATE users SET name=? WHERE id=?', [company_name.trim(), companyId]);
    }
    if (logo_url) {
      await pool.query('UPDATE users SET avatar_url=? WHERE id=?', [logo_url, companyId]);
    }
    if (contact_phone) {
      await pool.query('UPDATE users SET phone=? WHERE id=?', [contact_phone.trim(), companyId]);
    }
    await pool.query(
      `UPDATE companies SET
       company_name=?, industry_sector=?, description=?, website=?,
       logo_url=?, contact_email=?, contact_phone=?, linkedin_url=?, district=?, state=?
       WHERE user_id=?`,
      [
        company_name || 'Company', industry_sector || null, description || null, website || null,
        logo_url || null, contact_email || null, contact_phone || null, linkedin_url || null,
        district || null, state || null, companyId
      ]
    );
    const [userRows] = await pool.query('SELECT id, name, email, phone, avatar_url, role, status FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Company profile updated.', user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update company profile.' });
  }
});

// ---------- Job posting & required skills ----------
router.post('/jobs', requireCompanyRole, async (req, res) => {
  const companyId = await getCompanyId(req.user);
  const { title, description, job_type, location, district, state, skills } = req.body; // skills: [{skill_id, required_proficiency}]
  const [result] = await pool.query(
    'INSERT INTO jobs (company_id, title, description, job_type, location, district, state) VALUES (?,?,?,?,?,?,?)',
    [companyId, title, description, job_type || 'job', location, district, state]
  );
  if (Array.isArray(skills)) {
    for (const s of skills) {
      await pool.query('INSERT INTO job_skills (job_id, skill_id, required_proficiency) VALUES (?,?,?)', [result.insertId, s.skill_id, s.required_proficiency || 'beginner']);
    }
  }
  res.status(201).json({ message: 'Job posted.', jobId: result.insertId });
});

router.get('/jobs', async (req, res) => {
  const companyId = await getCompanyId(req.user);
  const [jobs] = await pool.query('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC', [companyId]);
  res.json({ jobs });
});

router.put('/jobs/:id/close', requireCompanyRole, async (req, res) => {
  const companyId = await getCompanyId(req.user);
  await pool.query('UPDATE jobs SET status="closed" WHERE id=? AND company_id=?', [req.params.id, companyId]);
  res.json({ message: 'Job closed.' });
});

// ---------- AI candidate matching for a job ----------
router.get('/jobs/:id/candidates', async (req, res) => {
  try {
    const [reqSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
      [req.params.id]
    );
    const [applicants] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
              sp.district, sp.college, sp.branch, sp.cgpa, sp.linkedin_url, sp.github_url, sp.portfolio_url, sp.resume_url,
              a.id AS applicationId, a.status, a.applied_at, a.interview_date, a.interview_mode, a.interview_link, a.interview_notes
       FROM applications a JOIN users u ON u.id = a.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE a.job_id = ?`, [req.params.id]
    );

    const results = [];
    for (const applicant of applicants) {
      const [studentSkills] = await pool.query(
        `SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
        [applicant.id]
      );
      const gap = analyzeSkillGap(studentSkills, reqSkills);

      // Get candidate's quiz passing stats and project count
      const [quizRows] = await pool.query(
        'SELECT COUNT(*) AS passedQuizzes, ROUND(AVG(score_percent)) AS avgScore FROM quiz_attempts WHERE student_id=? AND passed=1',
        [applicant.id]
      );
      const [projRows] = await pool.query('SELECT COUNT(*) AS totalProjects FROM projects WHERE student_id=?', [applicant.id]);

      results.push({
        ...applicant,
        student_id: applicant.id,
        matchScore: gap.matchScore,
        missingSkills: gap.missing.map(m => m.name),
        verifiedSkills: studentSkills.filter(s => s.verified).map(s => s.name),
        passedQuizzes: quizRows[0]?.passedQuizzes || 0,
        avgQuizScore: quizRows[0]?.avgScore || 0,
        totalProjects: projRows[0]?.totalProjects || 0
      });
    }
    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ candidates: results, applications: results });
  } catch (err) {
    console.error('Error in /jobs/:id/candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates for position.' });
  }
});

router.get('/jobs/:id/applications', async (req, res) => {
  try {
    const [reqSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
      [req.params.id]
    );
    const [applicants] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
              sp.district, sp.college, sp.branch, sp.cgpa, sp.linkedin_url, sp.github_url, sp.portfolio_url, sp.resume_url,
              a.id AS applicationId, a.status, a.applied_at, a.interview_date, a.interview_mode, a.interview_link, a.interview_notes
       FROM applications a JOIN users u ON u.id = a.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE a.job_id = ?`, [req.params.id]
    );

    const results = [];
    for (const applicant of applicants) {
      const [studentSkills] = await pool.query(
        `SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
        [applicant.id]
      );
      const gap = analyzeSkillGap(studentSkills, reqSkills);
      results.push({
        ...applicant,
        student_id: applicant.id,
        matchScore: gap.matchScore,
        missingSkills: gap.missing.map(m => m.name),
        verifiedSkills: studentSkills.filter(s => s.verified).map(s => s.name)
      });
    }
    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ applications: results, candidates: results });
  } catch (err) {
    console.error('Error in /jobs/:id/applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications for position.' });
  }
});

router.put('/applications/:id/status', requireCompanyRole, async (req, res) => {
  const { status } = req.body; // shortlisted, interview, offered, rejected, hired
  await pool.query('UPDATE applications SET status=? WHERE id=?', [status, req.params.id]);

  if (status === 'hired') {
    const [appRows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
    const [jobRows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [appRows[0].job_id]);
    const [compRows] = await pool.query('SELECT company_name, district FROM companies WHERE user_id = ?', [jobRows[0].company_id]);
    await pool.query(
      `INSERT INTO employment_records
       (student_id, company_id, job_title, status, outcome_type, milestone_days, employer_name, location_district, verification_level, verified_by_user_id, verified_at, start_date)
       VALUES (?, ?, ?, 'employed', 'employed', 30, ?, ?, 'employer_verified', ?, NOW(), CURDATE())`,
      [
        appRows[0].student_id,
        jobRows[0].company_id,
        jobRows[0].title,
        compRows[0]?.company_name || 'Employer',
        compRows[0]?.district || null,
        req.user.id
      ]
    );
    await pool.query('UPDATE student_profiles SET employment_status="employed" WHERE user_id=?', [appRows[0].student_id]);
  }
  res.json({ message: 'Application status updated.' });
});

// ---------- Verify Trainee Milestone Outcome (Level 2 Institute / Level 3 Employer) ----------
router.put('/verifications/:recordId', requireCompanyRole, async (req, res) => {
  try {
    const isEmployer = req.user.role === 'industry' || req.user.role === 'employer' || req.user.role === 'employee';
    const targetLevel = isEmployer ? 'employer_verified' : 'institute_verified';
    const { monthly_salary, notes } = req.body;

    const [recRows] = await pool.query('SELECT * FROM employment_records WHERE id = ?', [req.params.recordId]);
    if (!recRows.length) return res.status(404).json({ error: 'Employment record not found.' });

    await pool.query(`
      UPDATE employment_records
      SET verification_level = ?,
          verified_by_user_id = ?,
          verified_at = NOW(),
          monthly_salary = COALESCE(?, monthly_salary),
          follow_up_notes = COALESCE(?, follow_up_notes)
      WHERE id = ?
    `, [targetLevel, req.user.id, monthly_salary ? parseInt(monthly_salary) : null, notes || 'Verified by enterprise supervisor.', req.params.recordId]);

    res.json({ ok: true, message: `Milestone verified at Level 3 (${targetLevel === 'employer_verified' ? 'Employer Verified' : 'Institute Verified'}).` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify milestone outcome.' });
  }
});

// ---------- Pending Verifications Queue ----------
router.get('/pending-verifications', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [rows] = await pool.query(`
      SELECT er.*, u.name AS student_name, u.email AS student_email, u.phone AS student_phone,
             sp.college, sp.branch, sp.district AS student_district, sp.trainee_id,
             c.company_name
      FROM employment_records er
      JOIN users u ON u.id = er.student_id
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN companies c ON c.user_id = er.company_id
      WHERE er.company_id = ? OR er.verification_level = 'institute_verified' OR er.verification_level = 'self_reported'
      ORDER BY er.recorded_at DESC
      LIMIT 50
    `, [companyId]);
    res.json({ records: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pending verifications.' });
  }
});

// ---------- Schedule Interview for an Applicant ----------
router.put('/applications/:id/interview', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { interview_date, interview_mode, interview_link, interview_notes } = req.body;

    if (!interview_date) {
      return res.status(400).json({ error: 'Interview date and time are required.' });
    }

    const [rows] = await pool.query(
      'SELECT a.id FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ? AND j.company_id = ?',
      [req.params.id, companyId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Application not found or unauthorized.' });

    await pool.query(
      `UPDATE applications
       SET status='interview', interview_date=?, interview_mode=?, interview_link=?, interview_notes=?
       WHERE id=?`,
      [interview_date, interview_mode || 'online', interview_link || null, interview_notes || null, req.params.id]
    );
    res.json({ message: 'Interview scheduled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule interview.' });
  }
});

// ---------- Industry Assignments Management ----------
router.post('/assignments', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { title, description, instructions, skills_required, difficulty, deadline, attachment_url, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Assignment title is required.' });

    const [result] = await pool.query(
      `INSERT INTO assignments (company_id, title, description, instructions, skills_required, difficulty, deadline, attachment_url, status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [companyId, title.trim(), description || null, instructions || null, skills_required || null, difficulty || 'intermediate', deadline || null, attachment_url || null, status || 'published']
    );
    res.status(201).json({ message: 'Assignment created successfully.', assignmentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment.' });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [rows] = await pool.query(
      `SELECT a.*, COUNT(s.id) AS submission_count
       FROM assignments a
       LEFT JOIN assignment_submissions s ON s.assignment_id = a.id
       WHERE a.company_id = ?
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [companyId]
    );
    res.json({ assignments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

router.get('/assignments/:id', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ? AND company_id = ?', [req.params.id, companyId]);
    if (!rows.length) return res.status(404).json({ error: 'Assignment not found or not authorized.' });
    res.json({ assignment: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignment.' });
  }
});

router.put('/assignments/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { title, description, instructions, skills_required, difficulty, deadline, attachment_url, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Assignment title is required.' });

    const [result] = await pool.query(
      `UPDATE assignments
       SET title=?, description=?, instructions=?, skills_required=?, difficulty=?, deadline=?, attachment_url=?, status=?
       WHERE id=? AND company_id=?`,
      [title.trim(), description || null, instructions || null, skills_required || null, difficulty || 'intermediate', deadline || null, attachment_url || null, status || 'published', req.params.id, companyId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found or not authorized.' });
    res.json({ message: 'Assignment updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

router.delete('/assignments/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [result] = await pool.query('DELETE FROM assignments WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found or not authorized.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

router.put('/assignments/:id/status', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { status } = req.body;
    const [result] = await pool.query('UPDATE assignments SET status=? WHERE id=? AND company_id=?', [status, req.params.id, companyId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Assignment not found or not authorized.' });
    res.json({ message: `Assignment status updated to ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update assignment status.' });
  }
});

router.get('/assignments/:id/submissions', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [assign] = await pool.query('SELECT * FROM assignments WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!assign.length) return res.status(404).json({ error: 'Assignment not found or not authorized.' });

    const [submissions] = await pool.query(
      `SELECT s.*, u.name AS student_name, u.email AS student_email,
              sp.district, sp.college, sp.branch, sp.current_year, sp.cgpa, sp.linkedin_url, sp.github_url
       FROM assignment_submissions s
       JOIN users u ON u.id = s.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );
    res.json({ assignment: assign[0], submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

router.put('/submissions/:id/feedback', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { status, feedback } = req.body;
    const [rows] = await pool.query(
      `SELECT s.id FROM assignment_submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE s.id = ? AND a.company_id = ?`,
      [req.params.id, companyId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Submission not found or not authorized.' });

    await pool.query(
      'UPDATE assignment_submissions SET status=?, feedback=? WHERE id=?',
      [status || 'reviewed', feedback || null, req.params.id]
    );
    res.json({ message: 'Submission feedback saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
});

// ---------- Industry Teaching & Courses ----------
router.post('/courses', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [compRows] = await pool.query('SELECT company_name, district, state FROM companies WHERE user_id=?', [companyId]);
    const comp = compRows[0] || {};
    const { title, description, instructor, category, skills_covered, difficulty, duration_weeks, thumbnail_url, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Course title is required.' });

    const [result] = await pool.query(
      `INSERT INTO courses (company_id, title, description, provider, instructor, category, skills_covered, difficulty, duration_weeks, district, state, thumbnail_url, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        companyId, title.trim(), description || null, comp.company_name || 'Industry Partner',
        instructor || comp.company_name, category || 'Technical', skills_covered || null,
        difficulty || 'beginner', duration_weeks ? parseInt(duration_weeks) : 4,
        comp.district || 'National', comp.state || '', thumbnail_url || null, status || 'published'
      ]
    );
    res.status(201).json({ message: 'Course created successfully.', courseId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(DISTINCT l.id) AS lesson_count,
              COUNT(DISTINCT e.id) AS enrolled_count
       FROM courses c
       LEFT JOIN course_lessons l ON l.course_id = c.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.company_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [companyId]
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT * FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or not authorized.' });

    const [lessons] = await pool.query('SELECT * FROM course_lessons WHERE course_id=? ORDER BY lesson_order ASC, id ASC', [req.params.id]);
    res.json({ course: courses[0], lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
});

router.put('/courses/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { title, description, instructor, category, skills_covered, difficulty, duration_weeks, thumbnail_url, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Course title is required.' });

    const [result] = await pool.query(
      `UPDATE courses
       SET title=?, description=?, instructor=?, category=?, skills_covered=?, difficulty=?, duration_weeks=?, thumbnail_url=?, status=?
       WHERE id=? AND company_id=?`,
      [title.trim(), description || null, instructor || null, category || null, skills_covered || null, difficulty || 'beginner', duration_weeks ? parseInt(duration_weeks) : 4, thumbnail_url || null, status || 'published', req.params.id, companyId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found or not authorized.' });
    res.json({ message: 'Course updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

router.delete('/courses/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [result] = await pool.query('DELETE FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found or not authorized.' });
    res.json({ message: 'Course deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

router.put('/courses/:id/status', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { status } = req.body;
    const [result] = await pool.query('UPDATE courses SET status=? WHERE id=? AND company_id=?', [status, req.params.id, companyId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found or not authorized.' });
    res.json({ message: `Course is now ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update course status.' });
  }
});

// ---------- Lessons Management ----------
router.get('/courses/:id/lessons', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT * FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or not authorized.' });

    const [lessons] = await pool.query('SELECT * FROM course_lessons WHERE course_id=? ORDER BY lesson_order ASC, id ASC', [req.params.id]);
    res.json({ course: courses[0], lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lessons.' });
  }
});

router.post('/courses/:id/lessons', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT id FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or not authorized.' });

    const { title, lesson_order, content_type, content_url, content_text } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Lesson title is required.' });

    const [result] = await pool.query(
      'INSERT INTO course_lessons (course_id, title, lesson_order, content_type, content_url, content_text) VALUES (?,?,?,?,?,?)',
      [req.params.id, title.trim(), lesson_order ? parseInt(lesson_order) : 1, content_type || 'text', content_url || null, content_text || null]
    );
    res.status(201).json({ message: 'Lesson added.', lessonId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add lesson.' });
  }
});

router.put('/lessons/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [check] = await pool.query(
      'SELECT l.id FROM course_lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!check.length) return res.status(404).json({ error: 'Lesson not found or not authorized.' });

    const { title, lesson_order, content_type, content_url, content_text } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Lesson title is required.' });

    await pool.query(
      'UPDATE course_lessons SET title=?, lesson_order=?, content_type=?, content_url=?, content_text=? WHERE id=?',
      [title.trim(), lesson_order ? parseInt(lesson_order) : 1, content_type || 'text', content_url || null, content_text || null, req.params.id]
    );
    res.json({ message: 'Lesson updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lesson.' });
  }
});

router.delete('/lessons/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [check] = await pool.query(
      'SELECT l.id FROM course_lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!check.length) return res.status(404).json({ error: 'Lesson not found or not authorized.' });

    await pool.query('DELETE FROM course_lessons WHERE id=?', [req.params.id]);
    res.json({ message: 'Lesson deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

router.get('/courses/:id/students', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT * FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or not authorized.' });

    const [students] = await pool.query(
      `SELECT e.id AS enrollment_id, e.progress_percent, e.status, e.enrolled_at, e.completed_at,
              u.id AS student_id, u.name, u.email, sp.district, sp.college, sp.branch
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE e.course_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.params.id]
    );
    res.json({ course: courses[0], students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrolled students.' });
  }
});

// ---------- Course Quizzes & MCQ Assessments (Company-Authored) ----------
router.post('/courses/:id/quizzes', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT id FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or unauthorized.' });

    const { title, description, passing_score } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Quiz title is required.' });

    const [result] = await pool.query(
      'INSERT INTO course_quizzes (course_id, title, description, passing_score) VALUES (?,?,?,?)',
      [req.params.id, title.trim(), description || null, passing_score ? parseInt(passing_score) : 60]
    );
    res.status(201).json({ message: 'Quiz created successfully.', quizId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
});

router.get('/courses/:id/quizzes', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [courses] = await pool.query('SELECT id FROM courses WHERE id=? AND company_id=?', [req.params.id, companyId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found or unauthorized.' });

    const [quizzes] = await pool.query(
      `SELECT q.*,
              COUNT(DISTINCT qq.id) AS question_count,
              COUNT(DISTINCT qa.id) AS attempt_count
       FROM course_quizzes q
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
       WHERE q.course_id = ?
       GROUP BY q.id
       ORDER BY q.created_at ASC`,
      [req.params.id]
    );
    res.json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.*, c.title AS course_title FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    const [questions] = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC', [req.params.id]);
    res.json({ quiz: quizzes[0], questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
});

router.put('/quizzes/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.id FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    const { title, description, passing_score } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Quiz title is required.' });

    await pool.query(
      'UPDATE course_quizzes SET title=?, description=?, passing_score=? WHERE id=?',
      [title.trim(), description || null, passing_score ? parseInt(passing_score) : 60, req.params.id]
    );
    res.json({ message: 'Quiz updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
});

router.delete('/quizzes/:id', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.id FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    await pool.query('DELETE FROM course_quizzes WHERE id=?', [req.params.id]);
    res.json({ message: 'Quiz deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete quiz.' });
  }
});

router.post('/quizzes/:id/questions', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.id FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    const { question_text, option_a, option_b, option_c, option_d, correct_option, points } = req.body;
    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({ error: 'Question text, 4 options (A-D), and correct answer are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, points)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.params.id, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_option, points || 1]
    );
    res.status(201).json({ message: 'MCQ question added.', questionId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

router.delete('/quizzes/:id/questions/:qid', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.id FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    await pool.query('DELETE FROM quiz_questions WHERE id=? AND quiz_id=?', [req.params.qid, req.params.id]);
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
});

router.get('/quizzes/:id/attempts', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [quizzes] = await pool.query(
      'SELECT q.*, c.title AS course_title FROM course_quizzes q JOIN courses c ON c.id=q.course_id WHERE q.id=? AND c.company_id=?',
      [req.params.id, companyId]
    );
    if (!quizzes.length) return res.status(404).json({ error: 'Quiz not found or unauthorized.' });

    const [attempts] = await pool.query(
      `SELECT qa.*, u.name AS student_name, u.email AS student_email, u.phone AS student_phone, sp.college, sp.branch
       FROM quiz_attempts qa
       JOIN users u ON u.id = qa.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE qa.quiz_id = ?
       ORDER BY qa.attempted_at DESC`,
      [req.params.id]
    );
    res.json({ quiz: quizzes[0], attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
});

// ---------- Issue Certificate by Industry Partner ----------
router.post('/certificates', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { student_id, course_id, title, issue_date, certificate_url } = req.body;
    if (!student_id || !title || !title.trim()) {
      return res.status(400).json({ error: 'Student ID and Certificate Title are required.' });
    }

    const [compRows] = await pool.query('SELECT company_name FROM companies WHERE user_id = ?', [companyId]);
    const issuer = compRows[0]?.company_name || 'Industry Partner';

    const [result] = await pool.query(
      `INSERT INTO certificates (student_id, course_id, issuing_company_id, issued_by, title, issue_date, certificate_url)
       VALUES (?,?,?,?,?,?,?)`,
      [student_id, course_id || null, companyId, issuer, title.trim(), issue_date || new Date().toISOString().split('T')[0], certificate_url || null]
    );

    // Send notification to the student
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, 'Certificate Awarded!', ?, 'success')`,
      [student_id, `You have been awarded the certificate "${title.trim()}" by ${issuer}.`]
    );

    res.status(201).json({
      message: 'Certificate issued successfully.',
      certificateId: result.insertId,
      certificate: { id: result.insertId, title: title.trim() }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to issue certificate.' });
  }
});

// ---------- Company Employees & Team Management ("Industry Can Take Employees") ----------
router.get('/employees', async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const [employees] = await pool.query(`
      SELECT e.user_id, e.company_id, e.job_title,
             u.name, u.email, u.phone, u.avatar_url, u.status, u.created_at, u.role
      FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.company_id = ?
      ORDER BY u.created_at DESC
    `, [companyId]);
    res.json({ employees });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to load company employees.' });
  }
});

router.post('/employees', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { name, email, password, job_title, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and temporary password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, "employee", "active")',
      [name.trim(), email.trim(), phone ? phone.trim() : null, hash]
    );
    const newUserId = result.insertId;

    await pool.query(
      'INSERT INTO employees (user_id, company_id, job_title) VALUES (?, ?, ?)',
      [newUserId, companyId, job_title ? job_title.trim() : 'Recruiter & Team Member']
    );

    res.status(201).json({
      message: 'Employee successfully added to company roster.',
      employee: {
        user_id: newUserId,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        job_title: job_title ? job_title.trim() : 'Recruiter & Team Member',
        status: 'active'
      }
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to add employee.' });
  }
});

router.post('/employees/hire-candidate', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const student_id = req.body.student_id || req.body.candidate_id;
    const { job_id, job_title, salary, notes } = req.body;
    if (!student_id) {
      return res.status(400).json({ error: 'Student ID or candidate ID is required.' });
    }

    const [studentRows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [student_id]);
    if (!studentRows.length) {
      return res.status(404).json({ error: 'Student user not found.' });
    }

    const [compRows] = await pool.query('SELECT company_name, district FROM companies WHERE user_id = ?', [companyId]);
    const companyName = compRows[0]?.company_name || 'Hiring Company';
    const compDistrict = compRows[0]?.district || null;
    const finalJobTitle = job_title && job_title.trim() ? job_title.trim() : 'Graduate Trainee / Associate';

    // 1. Link or update in employees table
    const [existingEmp] = await pool.query('SELECT user_id FROM employees WHERE user_id = ?', [student_id]);
    if (existingEmp.length) {
      await pool.query('UPDATE employees SET company_id = ?, job_title = ? WHERE user_id = ?', [companyId, finalJobTitle, student_id]);
    } else {
      await pool.query('INSERT INTO employees (user_id, company_id, job_title) VALUES (?, ?, ?)', [student_id, companyId, finalJobTitle]);
    }

    // 2. Update student profile status
    await pool.query('UPDATE student_profiles SET employment_status = "employed" WHERE user_id = ?', [student_id]);

    // 3. Update application status
    if (job_id) {
      await pool.query('UPDATE applications SET status = "hired" WHERE student_id = ? AND job_id = ?', [student_id, job_id]);
    } else {
      await pool.query('UPDATE applications SET status = "hired" WHERE student_id = ?', [student_id]);
    }

    // 4. Record Level 3 employer verified employment record
    await pool.query(`
      INSERT INTO employment_records
      (student_id, company_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, verified_by_user_id, verified_at, start_date, follow_up_notes)
      VALUES (?, ?, ?, 'employed', 'employed', 30, ?, ?, ?, 'employer_verified', ?, NOW(), CURDATE(), ?)
    `, [
      student_id, companyId, finalJobTitle,
      salary || 35000,
      companyName,
      compDistrict,
      req.user.id,
      notes || 'Candidate recruited and inducted directly into company employee roster.'
    ]);

    // 5. Send notification to student
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'job_alert')
    `, [
      student_id,
      `Hired at ${companyName}!`,
      `Congratulations! You have been inducted into ${companyName} as ${finalJobTitle}. Your outcome has been officially verified at Level 3.`
    ]);

    res.json({
      message: `Candidate ${studentRows[0].name} successfully hired and added to company staff as ${finalJobTitle}.`,
      student_id,
      job_title: finalJobTitle
    });
  } catch (err) {
    console.error('Error hiring candidate as employee:', err);
    res.status(500).json({ error: 'Failed to complete hiring candidate as employee.' });
  }
});

router.put('/employees/:userId', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    const { job_title, phone } = req.body;

    await pool.query('UPDATE employees SET job_title = ? WHERE user_id = ? AND company_id = ?', [job_title || 'Team Member', req.params.userId, companyId]);
    if (phone) {
      await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone.trim(), req.params.userId]);
    }
    res.json({ message: 'Employee details updated.' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee.' });
  }
});

router.delete('/employees/:userId', requireCompanyRole, async (req, res) => {
  try {
    const companyId = await getCompanyId(req.user);
    await pool.query('DELETE FROM employees WHERE user_id = ? AND company_id = ?', [req.params.userId, companyId]);
    res.json({ message: 'Employee removed from company roster.' });
  } catch (err) {
    console.error('Error removing employee:', err);
    res.status(500).json({ error: 'Failed to remove employee.' });
  }
});

module.exports = router;
