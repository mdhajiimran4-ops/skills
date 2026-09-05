const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  CANONICAL_ROLES,
  analyzeSkillGap,
  generatePersonalizedLearningPlan,
  analyzeSkillGapWithRoadmap,
  calculateEmployabilityScore,
  recommendCourses,
  buildStudentReport
} = require('../utils/aiEngine');

const router = express.Router();
router.use(requireAuth);

async function getEffectiveStudentId(req) {
  if (req.user && req.user.role === 'student') return req.user.id;
  const requestedId = req.query?.student_id || req.query?.id || req.body?.student_id;
  if (requestedId) {
    const parsed = parseInt(requestedId, 10);
    if (!isNaN(parsed)) return parsed;
  }
  const [firstSt] = await pool.query('SELECT id FROM users WHERE role="student" ORDER BY id ASC LIMIT 1');
  return firstSt.length ? firstSt[0].id : req.user.id;
}

// ---------- Profile (LinkedIn/GitHub-style) ----------
router.get('/profile', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [profileRows] = await pool.query(
    `SELECT sp.*, u.name, u.email
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = ?`,
    [targetId]
  );
  let profile = profileRows[0] || {};
  if (profile && !profile.trainee_id) {
    const generatedId = `ST-2026-TR-${String(targetId).padStart(4, '0')}`;
    await pool.query('UPDATE student_profiles SET trainee_id = ? WHERE user_id = ?', [generatedId, targetId]);
    profile.trainee_id = generatedId;
  }
  const [skillRows] = await pool.query(
    `SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified
     FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`, [targetId]);
  const [certRows] = await pool.query('SELECT * FROM certificates WHERE student_id = ? ORDER BY issue_date DESC', [targetId]);
  const [projectRows] = await pool.query('SELECT * FROM projects WHERE student_id = ? ORDER BY created_at DESC', [targetId]);
  res.json({ profile, skills: skillRows, certificates: certRows, projects: projectRows });
});

router.put('/profile', async (req, res) => {
  try {
    const {
      name, headline, bio, district, state, phone,
      college, branch, current_year, semester, cgpa, graduation_year, college_id,
      linkedin_url, github_url, portfolio_url, resume_url, avatar_url, employment_status,
      experience, preferred_jobs
    } = req.body;

    // Validation
    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      const numCgpa = parseFloat(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        return res.status(400).json({ error: 'CGPA must be a valid number between 0.0 and 10.0' });
      }
    }
    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number (7-20 digits).' });
    }
    if (linkedin_url && !linkedin_url.startsWith('http://') && !linkedin_url.startsWith('https://')) {
      return res.status(400).json({ error: 'LinkedIn URL must start with http:// or https://' });
    }
    if (github_url && !github_url.startsWith('http://') && !github_url.startsWith('https://')) {
      return res.status(400).json({ error: 'GitHub URL must start with http:// or https://' });
    }

    if (name && name.trim()) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
    }
    if (avatar_url !== undefined) {
      await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url ? avatar_url.trim() : null, req.user.id]);
    }
    if (phone !== undefined) {
      await pool.query('UPDATE users SET phone = ? WHERE id = ?', [phone ? phone.trim() : null, req.user.id]);
    }

    await pool.query(
      `UPDATE student_profiles SET
       headline=?, bio=?, district=?, state=?, phone=?,
       college=?, branch=?, current_year=?, semester=?, cgpa=?, graduation_year=?, college_id=?,
       portfolio_url=?, linkedin_url=?, github_url=?, resume_url=?, avatar_url=?, employment_status=?,
       experience=?, preferred_jobs=?
       WHERE user_id=?`,
      [
        headline || null, bio || null, district || null, state || null, phone || null,
        college || null, branch || null, current_year || null, semester || null,
        cgpa !== undefined && cgpa !== '' ? cgpa : null,
        graduation_year ? parseInt(graduation_year) : null,
        college_id || null, portfolio_url || null,
        linkedin_url || null, github_url || null, resume_url || null, avatar_url ? avatar_url.trim() : null,
        employment_status || 'seeking',
        experience || null, preferred_jobs || null,
        req.user.id
      ]
    );
    if (req.body.consent_given !== undefined) {
      const consentVal = req.body.consent_given ? 1 : 0;
      await pool.query('UPDATE student_profiles SET consent_given = ?, consent_date = NOW() WHERE user_id = ?', [consentVal, req.user.id]);
    }
    const [userRows] = await pool.query('SELECT id, name, email, phone, avatar_url, role, status FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated.', user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ---------- Feature 1: Consent-Based Trainee Profile Toggle ----------
router.put('/consent', async (req, res) => {
  try {
    const consent = req.body.consent ? 1 : 0;
    await pool.query('UPDATE student_profiles SET consent_given = ?, consent_date = NOW() WHERE user_id = ?', [consent, req.user.id]);
    res.json({
      ok: true,
      consent_given: !!consent,
      message: consent ? 'Workforce tracking consent active.' : 'Workforce tracking consent paused.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update consent status.' });
  }
});

// ---------- Avatar Removal (Initials Fallback Lifecycle) ----------
router.post('/profile/avatar/remove', async (req, res) => {
  try {
    await pool.query('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
    await pool.query('UPDATE student_profiles SET avatar_url = NULL WHERE user_id = ?', [req.user.id]);
    res.json({ ok: true, message: 'Profile photo removed. Initial avatar restored.', avatar_url: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove avatar.' });
  }
});

// ---------- Skills ----------
router.post('/skills', async (req, res) => {
  try {
    let { skill_id, skill_name, proficiency } = req.body;
    if (!skill_id && skill_name && skill_name.trim()) {
      const [existing] = await pool.query('SELECT id FROM skills WHERE LOWER(name) = LOWER(?)', [skill_name.trim()]);
      if (existing.length) {
        skill_id = existing[0].id;
      } else {
        const [inserted] = await pool.query('INSERT INTO skills (name, category) VALUES (?, ?)', [skill_name.trim(), 'Technical']);
        skill_id = inserted.insertId;
      }
    }

    if (!skill_id) {
      return res.status(400).json({ error: 'skill_id or skill_name is required.' });
    }

    await pool.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)`,
      [req.user.id, skill_id, proficiency || 'beginner']
    );
    res.json({ message: 'Skill saved.', skill_id });
  } catch (err) {
    console.error('Save skill error:', err);
    res.status(500).json({ error: 'Failed to save skill.' });
  }
});

router.get('/skills-master', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM skills ORDER BY category, name');
  res.json({ skills: rows });
});

router.delete('/skills/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?', [req.user.id, req.params.id]);
    res.json({ ok: true, message: 'Skill removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove skill.' });
  }
});

// ---------- Projects (portfolio / "kits built and sold") ----------
router.post('/projects', async (req, res) => {
  const { title, description, tech_stack, project_url, repo_url, image_url, status } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Project title is required.' });
  const [result] = await pool.query(
    'INSERT INTO projects (student_id, title, description, tech_stack, project_url, repo_url, image_url, status) VALUES (?,?,?,?,?,?,?,?)',
    [req.user.id, title.trim(), description || null, tech_stack || null, project_url || null, repo_url || null, image_url || null, status || 'completed']
  );
  res.status(201).json({ message: 'Project added.', projectId: result.insertId });
});

router.put('/projects/:id', async (req, res) => {
  const { title, description, tech_stack, project_url, repo_url, image_url, status } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Project title is required.' });
  const [result] = await pool.query(
    'UPDATE projects SET title=?, description=?, tech_stack=?, project_url=?, repo_url=?, image_url=?, status=? WHERE id=? AND student_id=?',
    [title.trim(), description || null, tech_stack || null, project_url || null, repo_url || null, image_url || null, status || 'completed', req.params.id, req.user.id]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Project not found or not authorized.' });
  }
  res.json({ message: 'Project updated.' });
});

router.delete('/projects/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM projects WHERE id=? AND student_id=?', [req.params.id, req.user.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Project not found or not authorized.' });
  }
  res.json({ message: 'Project deleted.' });
});

// ---------- Courses & enrollment ----------
router.get('/courses', async (req, res) => {
  const [courses] = await pool.query(
    `SELECT c.*, comp.company_name
     FROM courses c
     LEFT JOIN companies comp ON comp.user_id = c.company_id
     WHERE c.status IS NULL OR c.status = 'published'
     ORDER BY c.created_at DESC`
  );
  const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE student_id = ?', [req.user.id]);
  res.json({ courses, enrollments });
});

router.get('/courses/:id/lessons', async (req, res) => {
  const [courseRows] = await pool.query(
    `SELECT c.*, comp.company_name
     FROM courses c
     LEFT JOIN companies comp ON comp.user_id = c.company_id
     WHERE c.id = ?`,
    [req.params.id]
  );
  if (!courseRows.length) return res.status(404).json({ error: 'Course not found.' });

  const [lessons] = await pool.query(
    'SELECT * FROM course_lessons WHERE course_id = ? ORDER BY lesson_order ASC, id ASC',
    [req.params.id]
  );
  res.json({ course: courseRows[0], lessons });
});

router.post('/courses/:id/enroll', async (req, res) => {
  await pool.query(
    `INSERT INTO enrollments (student_id, course_id) VALUES (?,?)
     ON DUPLICATE KEY UPDATE status='enrolled'`,
    [req.user.id, req.params.id]
  );
  res.json({ message: 'Enrolled successfully.' });
});

router.put('/courses/:id/progress', async (req, res) => {
  const { progress_percent } = req.body;
  const status = progress_percent >= 100 ? 'completed' : 'in_progress';
  await pool.query(
    'UPDATE enrollments SET progress_percent=?, status=?, completed_at = IF(?>=100, NOW(), NULL) WHERE student_id=? AND course_id=?',
    [progress_percent, status, progress_percent, req.user.id, req.params.id]
  );
  res.json({ message: 'Progress updated.' });
});

// ---------- Industry Assignments for Students ----------
router.get('/assignments', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [rows] = await pool.query(
    `SELECT a.*, c.company_name, c.logo_url, c.district AS company_district,
            s.id AS submission_id, s.status AS submission_status, s.submitted_at, s.repo_url AS submission_repo, s.file_url AS submission_file, s.feedback
     FROM assignments a
     JOIN companies c ON c.user_id = a.company_id
     LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
     WHERE a.status = 'published'
     ORDER BY a.created_at DESC`,
    [targetId]
  );
  res.json({ assignments: rows });
});

router.post('/assignments/:id/submit', async (req, res) => {
  const { submission_text, repo_url, file_url } = req.body;
  if (!submission_text && !repo_url && !file_url) {
    return res.status(400).json({ error: 'Please provide notes, repo link, or attached file.' });
  }
  const [assignRows] = await pool.query("SELECT id FROM assignments WHERE id=? AND status='published'", [req.params.id]);
  if (!assignRows.length) return res.status(404).json({ error: 'Assignment not found or closed.' });

  await pool.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, repo_url, file_url, status)
     VALUES (?,?,?,?,?,'submitted')
     ON DUPLICATE KEY UPDATE submission_text=VALUES(submission_text), repo_url=VALUES(repo_url), file_url=VALUES(file_url), status='submitted', submitted_at=NOW()`,
    [req.params.id, req.user.id, submission_text || null, repo_url || null, file_url || null]
  );
  res.json({ message: 'Assignment submitted successfully!' });
});

router.get('/my-submissions', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [rows] = await pool.query(
    `SELECT s.*, a.title AS assignment_title, a.difficulty, a.deadline, c.company_name
     FROM assignment_submissions s
     JOIN assignments a ON a.id = s.assignment_id
     JOIN companies c ON c.user_id = a.company_id
     WHERE s.student_id = ?
     ORDER BY s.submitted_at DESC`,
    [targetId]
  );
  res.json({ submissions: rows });
});

// ---------- Jobs feed + AI match score ----------
router.get('/jobs', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [jobs] = await pool.query(
    `SELECT j.*, c.company_name FROM jobs j JOIN companies c ON c.user_id = j.company_id WHERE j.status='open' ORDER BY j.created_at DESC`
  );
  const [studentSkills] = await pool.query(
    `SELECT s.id AS skill_id, s.name, ss.proficiency FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
    [targetId]
  );

  const jobsWithScore = [];
  for (const job of jobs) {
    const [reqSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
      [job.id]
    );
    const gap = analyzeSkillGap(studentSkills, reqSkills);
    jobsWithScore.push({ ...job, matchScore: gap.matchScore, missingSkills: gap.missing.map(m => m.name) });
  }
  jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
  res.json({ jobs: jobsWithScore });
});

router.post('/jobs/:id/apply', async (req, res) => {
  const [studentSkills] = await pool.query(
    `SELECT s.id AS skill_id, s.name, ss.proficiency FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
    [req.user.id]
  );
  const [reqSkills] = await pool.query(
    `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
    [req.params.id]
  );
  const gap = analyzeSkillGap(studentSkills, reqSkills);
  await pool.query(
    `INSERT INTO applications (job_id, student_id, match_score) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE match_score = VALUES(match_score)`,
    [req.params.id, req.user.id, gap.matchScore]
  );
  res.status(201).json({ message: 'Application submitted.', matchScore: gap.matchScore });
});

router.get('/applications', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [rows] = await pool.query(
    `SELECT a.*, j.title, j.location, j.job_type, c.company_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.user_id = j.company_id
     WHERE a.student_id = ?
     ORDER BY a.applied_at DESC`,
    [targetId]
  );
  res.json({ applications: rows });
});
// ---------- AI skill gap + recommendations for a specific job ----------
router.get('/ai/skill-gap/:jobId', async (req, res) => {
  const targetId = await getEffectiveStudentId(req);
  const [studentSkills] = await pool.query(
    `SELECT s.id AS skill_id, s.name, ss.proficiency FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
    [targetId]
  );
  const [reqSkills] = await pool.query(
    `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
    [req.params.jobId]
  );
  const gap = analyzeSkillGap(studentSkills, reqSkills);

  const [courseRows] = await pool.query(
    `SELECT c.id, c.title, cs.skill_id FROM courses c JOIN course_skills cs ON cs.course_id = c.id`
  );
  const courseMap = {};
  for (const row of courseRows) {
    if (!courseMap[row.id]) courseMap[row.id] = { id: row.id, title: row.title, skill_ids: [] };
    courseMap[row.id].skill_ids.push(row.skill_id);
  }
  const recommendations = recommendCourses(gap.missing.map(m => m.skill_id), Object.values(courseMap));

  const [nameRows] = await pool.query('SELECT name FROM users WHERE id = ?', [targetId]);
  const report = buildStudentReport(nameRows[0]?.name || 'Student', gap);

  res.json({ ...gap, recommendedCourses: recommendations, report });
});

// ---------- Employability Readiness Score (SIH26135) ----------
router.get('/readiness', async (req, res) => {
  try {
    const targetId = await getEffectiveStudentId(req);
    const [profileRows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [targetId]);
    const [skills] = await pool.query(`
      SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified
      FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?
    `, [targetId]);
    const [certs] = await pool.query('SELECT * FROM certificates WHERE student_id = ?', [targetId]);
    const [projects] = await pool.query('SELECT * FROM projects WHERE student_id = ?', [targetId]);
    const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE student_id = ?', [targetId]);

    const result = calculateEmployabilityScore(profileRows[0] || {}, skills, certs, projects, enrollments);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate employability readiness score.' });
  }
});

// ---------- AI Skill Gap with 5-Step Learning Roadmap ----------
router.get('/ai/roadmap/:jobId', async (req, res) => {
  try {
    const targetId = await getEffectiveStudentId(req);
    const [studentSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, ss.proficiency FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
      [targetId]
    );
    const [jobRows] = await pool.query('SELECT id, title FROM jobs WHERE id = ?', [req.params.jobId]);
    if (!jobRows.length) return res.status(404).json({ error: 'Job not found.' });

    const [reqSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, js.required_proficiency FROM job_skills js JOIN skills s ON s.id = js.skill_id WHERE js.job_id = ?`,
      [req.params.jobId]
    );

    const roadmapData = analyzeSkillGapWithRoadmap(studentSkills, reqSkills, jobRows[0].title);
    res.json({ job: jobRows[0], ...roadmapData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});

// ---------- Canonical Target Roles ----------
router.get('/ai/target-roles', (req, res) => {
  res.json({ roles: CANONICAL_ROLES });
});

// ---------- AI Target Role Skill Gap Analysis ----------
const handleSkillGapAnalysis = async (req, res) => {
  try {
    const roleIdentifier = (req.body.roleId || req.body.targetRole || req.body.target_role || req.body.role || '').trim();
    const roleLower = roleIdentifier.toLowerCase();

    // Smart fuzzy matching for custom career roles or typos
    let targetRole = CANONICAL_ROLES.find(r =>
      r.id === roleIdentifier ||
      r.title.toLowerCase() === roleLower
    );

    if (!targetRole && roleLower) {
      if (roleLower.includes('data') || roleLower.includes('anylat') || roleLower.includes('analyt') || roleLower.includes('bi')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'data-analyst');
      } else if (roleLower.includes('cloud') || roleLower.includes('devops') || roleLower.includes('infra')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'cloud-devops');
      } else if (roleLower.includes('machine') || roleLower.includes('ml') || roleLower.includes('ai')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'ml-engineer');
      } else if (roleLower.includes('security') || roleLower.includes('cyber') || roleLower.includes('soc')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'cybersecurity-analyst');
      } else if (roleLower.includes('front') || roleLower.includes('ui') || roleLower.includes('react')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'frontend-dev');
      } else if (roleLower.includes('back') || roleLower.includes('api') || roleLower.includes('node')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'backend-dev');
      } else if (roleLower.includes('electric') || roleLower.includes('hardware') || roleLower.includes('iot')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'electrical-tech');
      } else if (roleLower.includes('full') || roleLower.includes('web') || roleLower.includes('software')) {
        targetRole = CANONICAL_ROLES.find(r => r.id === 'full-stack-dev');
      }
    }

    if (!targetRole) {
      targetRole = {
        id: 'custom_role',
        title: roleIdentifier || 'Technical Specialist',
        category: 'Technical',
        requiredSkills: [
          { name: 'Python', requiredProficiency: 'intermediate' },
          { name: 'SQL', requiredProficiency: 'intermediate' },
          { name: 'JavaScript', requiredProficiency: 'intermediate' },
          { name: 'Problem Solving', requiredProficiency: 'advanced' },
          { name: 'System Design', requiredProficiency: 'beginner' }
        ]
      };
    }

    const targetId = await getEffectiveStudentId(req);
    const [studentSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified
       FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
      [targetId]
    );

    const [profileRows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [targetId]);
    const [courses] = await pool.query('SELECT * FROM courses WHERE status IS NULL OR status="published"');
    const [nameRows] = await pool.query('SELECT name FROM users WHERE id = ?', [targetId]);
    const [certRows] = await pool.query('SELECT * FROM certificates WHERE student_id = ?', [targetId]);
    const [projectRows] = await pool.query('SELECT * FROM projects WHERE student_id = ?', [targetId]);

    const gap = analyzeSkillGap(studentSkills, targetRole.requiredSkills);
    const learningPlan = generatePersonalizedLearningPlan(profileRows[0] || {}, gap, targetRole.title, courses);
    const report = buildStudentReport(nameRows[0]?.name || 'Student', gap);
    const employabilityReadiness = calculateEmployabilityScore(
      profileRows[0] || {},
      studentSkills,
      certRows,
      projectRows
    );

    const matched = gap.matched || [];
    const missing = gap.missing || [];
    const partial = gap.weak || gap.partiallyMatched || [];

    const missingRanked = missing.map((s, idx) => ({
      name: typeof s === 'string' ? s : (s.name || s.skill || 'Skill'),
      priority: typeof s === 'object' && s.priority ? s.priority : (idx < 2 ? 'High' : (idx < 4 ? 'Medium' : 'Low'))
    }));

    const gapPercentage = Math.max(0, 100 - (gap.matchScore || 0));

    res.json({
      targetRole: targetRole.title,
      target_role: targetRole.title,
      matchPercentage: gap.matchScore,
      matchScore: gap.matchScore,
      gap_percentage: gapPercentage,
      gapScore: gapPercentage,
      matchedSkills: matched,
      matched: matched,
      missingSkills: missing,
      missing: missing,
      missing_skills: missing,
      partiallyMatchedSkills: partial,
      partialSkills: partial,
      weak: partial,
      missingSkillsRanked: missingRanked,
      recommended_courses: learningPlan?.recommendedCourses || [],
      totalTargetSkills: (targetRole.requiredSkills || []).length || (matched.length + missing.length + partial.length) || 5,
      summary: report?.summary || `Analysis computed against ${targetRole.title} industry benchmarks.`,
      employabilityReadiness,
      learningPlan,
      report
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze target role skill gap.' });
  }
};

router.post('/ai/analyze-target-role', handleSkillGapAnalysis);
router.post('/skill-gap', handleSkillGapAnalysis);

// ---------- Personalized Learning Plan ----------
router.get('/learning-plan', async (req, res) => {
  try {
    const targetId = await getEffectiveStudentId(req);
    const [studentSkills] = await pool.query(
      `SELECT s.id AS skill_id, s.name, ss.proficiency, ss.verified
       FROM student_skills ss JOIN skills s ON s.id = ss.skill_id WHERE ss.student_id = ?`,
      [targetId]
    );
    const [profileRows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [targetId]);
    const [courses] = await pool.query('SELECT * FROM courses WHERE status IS NULL OR status="published"');
    
    // Choose target role from query, student preferred_jobs or default
    const queryRole = req.query.targetRole || req.query.roleId;
    const preferred = queryRole || profileRows[0]?.preferred_jobs || 'Full Stack Developer';
    const matchedRole = CANONICAL_ROLES.find(r =>
      r.id === preferred ||
      (preferred && r.title.toLowerCase().includes(preferred.toLowerCase())) ||
      (preferred && preferred.toLowerCase().includes(r.title.toLowerCase()))
    ) || CANONICAL_ROLES[0];

    const gap = analyzeSkillGap(studentSkills, matchedRole.requiredSkills);
    const plan = generatePersonalizedLearningPlan(profileRows[0] || {}, gap, matchedRole.title, courses);

    res.json({
      ...plan,
      roadmap: plan.suggestedSequence,
      certifications: plan.recommendedCertifications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate personalized learning plan.' });
  }
});

// ---------- Certificates (Self-Managed + Platform) ----------
router.get('/certificates', async (req, res) => {
  try {
    const targetId = await getEffectiveStudentId(req);
    const [rows] = await pool.query('SELECT * FROM certificates WHERE student_id = ? ORDER BY issue_date DESC', [targetId]);
    res.json({ certificates: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
});

router.post('/certificates', async (req, res) => {
  try {
    const { title, issued_by, issuer, issue_date, certificate_url, credential_id, credential_url } = req.body;
    const certTitle = title ? title.trim() : '';
    const certIssuer = (issued_by || issuer || 'Self-Reported Organization').trim();
    if (!certTitle) return res.status(400).json({ error: 'Certificate title is required.' });

    const [result] = await pool.query(
      `INSERT INTO certificates (student_id, title, issued_by, issue_date, certificate_url)
       VALUES (?,?,?,?,?)`,
      [req.user.id, certTitle, certIssuer, issue_date || new Date().toISOString().split('T')[0], certificate_url || credential_url || null]
    );

    res.status(201).json({
      message: 'Certificate added successfully.',
      certificateId: result.insertId,
      certificate: { id: result.insertId, title: certTitle }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add certificate.' });
  }
});

router.delete('/certificates/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM certificates WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Certificate not found or unauthorized.' });
    res.json({ ok: true, message: 'Certificate removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete certificate.' });
  }
});

// ---------- Student Notifications ----------
router.get('/notifications', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );

    if (!rows.length) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, 'Welcome to SkillTrack!', 'Complete your profile, run an AI Skill Gap analysis, and add portfolio projects to boost your Employability Readiness.', 'info')`,
        [req.user.id]
      );
      const [fresh] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      return res.json({ notifications: fresh });
    }

    res.json({ notifications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark notification.' });
  }
});

// ---------- Student Settings (Password Change) ----------
router.put('/settings/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const [userRows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!userRows.length || !userRows[0].password_hash) {
      return res.status(400).json({ error: 'Password cannot be changed for this account type.' });
    }

    const valid = await bcrypt.compare(currentPassword, userRows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ---------- Longitudinal Follow-up Reporting (30, 90, 180, 365 days) ----------
router.post('/follow-up', async (req, res) => {
  try {
    const {
      milestone_days, outcome_type, job_title, monthly_salary,
      employer_name, location_district, unemployment_reason, unemployment_notes, follow_up_notes
    } = req.body;

    const days = parseInt(milestone_days) || 30;
    const outcome = outcome_type || 'employed';
    const statusMap = {
      'employed': 'employed',
      'self_employed': 'employed',
      'apprenticeship': 'employed',
      'seeking': 'unemployed',
      'higher_education': 'higher_education'
    };
    const mappedStatus = statusMap[outcome] || 'employed';

    // Insert follow-up milestone event
    const [result] = await pool.query(`
      INSERT INTO employment_records
      (student_id, job_title, status, outcome_type, milestone_days, monthly_salary, employer_name, location_district, verification_level, unemployment_reason, unemployment_notes, follow_up_notes, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'self_reported', ?, ?, ?, CURDATE())
    `, [
      req.user.id,
      job_title || (outcome === 'seeking' ? 'Seeking Employment' : (outcome === 'self_employed' ? 'Self-Employed' : 'Trainee')),
      mappedStatus,
      outcome,
      days,
      monthly_salary ? parseInt(monthly_salary) : null,
      employer_name || null,
      location_district || null,
      unemployment_reason || null,
      unemployment_notes || null,
      follow_up_notes || null
    ]);

    // Update current employment status in student_profiles
    await pool.query('UPDATE student_profiles SET employment_status = ? WHERE user_id = ?', [mappedStatus, req.user.id]);

    res.status(201).json({
      message: `Milestone report for ${days} days recorded successfully. Verification level: Level 1 (Self-reported).`,
      recordId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save milestone follow-up.' });
  }
});

// ---------- Student Career & Retention Journey ----------
router.get('/career-journey', async (req, res) => {
  try {
    const targetId = await getEffectiveStudentId(req);
    const [rows] = await pool.query(`
      SELECT er.*, c.company_name, u.name AS verified_by_name
      FROM employment_records er
      LEFT JOIN companies c ON c.user_id = er.company_id
      LEFT JOIN users u ON u.id = er.verified_by_user_id
      WHERE er.student_id = ?
      ORDER BY er.milestone_days ASC, er.recorded_at ASC
    `, [targetId]);
    res.json({ journey: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch career journey.' });
  }
});

// ---------- Employment status / follow-up (Backwards compatibility) ----------
router.get('/employment-history', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM employment_records WHERE student_id = ? ORDER BY recorded_at DESC', [req.user.id]);
  res.json({ history: rows });
});

// ---------- Course Quizzes & MCQ Assessments for Students ----------
router.get('/courses/:id/quizzes', async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      `SELECT q.*,
              COUNT(DISTINCT qq.id) AS question_count,
              MAX(qa.score_percent) AS best_score,
              MAX(qa.passed) AS has_passed
       FROM course_quizzes q
       LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = ?
       WHERE q.course_id = ?
       GROUP BY q.id
       ORDER BY q.created_at ASC`,
      [req.user.id, req.params.id]
    );
    res.json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course quizzes.' });
  }
});

router.get('/quizzes/:id/take', async (req, res) => {
  try {
    const [quizRows] = await pool.query('SELECT id, course_id, title, description, passing_score FROM course_quizzes WHERE id = ?', [req.params.id]);
    if (!quizRows.length) return res.status(404).json({ error: 'Quiz not found.' });

    // Return questions WITHOUT correct_option exposed
    const [questions] = await pool.query(
      'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, points FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC',
      [req.params.id]
    );
    res.json({ quiz: quizRows[0], questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz questions.' });
  }
});

router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers payload is required.' });
    }

    let answerMap = {};
    if (Array.isArray(answers)) {
      for (const item of answers) {
        if (item && item.question_id !== undefined) {
          answerMap[item.question_id] = item.selected_option;
        }
      }
    } else {
      answerMap = answers;
    }

    const [quizRows] = await pool.query('SELECT * FROM course_quizzes WHERE id = ?', [req.params.id]);
    if (!quizRows.length) return res.status(404).json({ error: 'Quiz not found.' });
    const quiz = quizRows[0];

    const [questions] = await pool.query('SELECT id, correct_option, points FROM quiz_questions WHERE quiz_id = ?', [req.params.id]);
    if (!questions.length) return res.status(400).json({ error: 'Quiz has no questions.' });

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of questions) {
      const pts = q.points || 1;
      totalPoints += pts;
      const given = answerMap[q.id];
      if (given && String(given).trim().toUpperCase() === String(q.correct_option).trim().toUpperCase()) {
        earnedPoints += pts;
      }
    }

    const scorePercent = Math.round((earnedPoints / totalPoints) * 100);
    const passed = scorePercent >= quiz.passing_score;

    await pool.query(
      'INSERT INTO quiz_attempts (quiz_id, student_id, score_percent, passed) VALUES (?,?,?,?)',
      [quiz.id, req.user.id, scorePercent, passed]
    );

    // If passed, mark associated course skills verified in student_skills!
    if (passed) {
      const [courseSkills] = await pool.query('SELECT skill_id FROM course_skills WHERE course_id = ?', [quiz.course_id]);
      for (const cs of courseSkills) {
        await pool.query(
          `INSERT INTO student_skills (student_id, skill_id, proficiency, verified)
           VALUES (?,?, 'intermediate', true)
           ON DUPLICATE KEY UPDATE verified = true`,
          [req.user.id, cs.skill_id]
        );
      }
    }

    res.json({
      scorePercent,
      passed,
      passingScore: quiz.passing_score,
      earnedPoints,
      totalPoints,
      message: passed
        ? `Congratulations! You passed with ${scorePercent}% score!`
        : `You scored ${scorePercent}%. Passing score is ${quiz.passing_score}%.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
});

router.get('/courses/:id/my-quiz-attempts', async (req, res) => {
  try {
    const [attempts] = await pool.query(
      `SELECT qa.*, q.title AS quiz_title, q.passing_score
       FROM quiz_attempts qa
       JOIN course_quizzes q ON q.id = qa.quiz_id
       WHERE q.course_id = ? AND qa.student_id = ?
       ORDER BY qa.attempted_at DESC`,
      [req.params.id, req.user.id]
    );
    res.json({ attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
});

module.exports = router;
