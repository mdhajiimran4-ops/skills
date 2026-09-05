const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ---------- Master skills list (used by student skill picker AND industry job-posting form) ----------
router.get('/skills-master', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM skills ORDER BY category, name');
  res.json({ skills: rows });
});

// ---------- Browse courses / trainings (no login required) ----------
router.get('/courses', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT c.*, comp.company_name
    FROM courses c
    LEFT JOIN companies comp ON comp.user_id = c.company_id
    WHERE c.status IS NULL OR c.status = 'published'
    ORDER BY c.created_at DESC
  `);
  res.json({ courses: rows });
});

// ---------- Browse open jobs / internships (no login required) ----------
router.get('/jobs', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT j.id, j.title, j.job_type, j.location, j.district, c.company_name
     FROM jobs j JOIN companies c ON c.user_id = j.company_id WHERE j.status='open' ORDER BY j.created_at DESC`
  );
  res.json({ jobs: rows });
});

// ---------- Investor read-only dashboard: aggregate impact stats, no PII ----------
router.get('/investor/impact', requireAuth, async (req, res) => {
  const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) AS totalStudents FROM users WHERE role='student'");
  const [[{ totalEmployed }]] = await pool.query("SELECT COUNT(*) AS totalEmployed FROM employment_records WHERE status='employed'");
  const [[{ totalCompanies }]] = await pool.query("SELECT COUNT(*) AS totalCompanies FROM users WHERE role='industry' AND status='active'");
  const [[{ totalCourses }]] = await pool.query("SELECT COUNT(*) AS totalCourses FROM courses");
  const [districtRows] = await pool.query(`
    SELECT sp.district, COUNT(*) AS students, SUM(CASE WHEN sp.employment_status='employed' THEN 1 ELSE 0 END) AS employed
    FROM student_profiles sp WHERE sp.district IS NOT NULL AND sp.district <> '' GROUP BY sp.district
  `);
  const employmentRate = totalStudents ? Math.round((totalEmployed / totalStudents) * 100) : 0;
  res.json({ totalStudents, totalEmployed, totalCompanies, totalCourses, employmentRate, districtRows });
});

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.txt', '.zip'
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ---------- Secure file upload for avatars, resumes, projects, assignments ----------
router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName and fileData are required.' });
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: `File type ${ext} is not allowed. Allowed types: PDF, Word, Images, Text, Zip.` });
    }

    const base64Content = fileData.includes(';base64,')
      ? fileData.split(';base64,')[1]
      : fileData;
    const buffer = Buffer.from(base64Content, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 10MB.' });
    }

    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', safeName);

    await fs.promises.writeFile(uploadPath, buffer);
    res.json({
      url: `/uploads/${safeName}`,
      fileName: path.basename(fileName),
      size: buffer.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to save file.' });
  }
});

// ---------- Full Trainee Profile Dossier (Universal Access for Institutes, Employers, Government) ----------
router.get('/trainee-profile/:id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({ error: 'Valid student ID is required.' });
    }

    const [userRows] = await pool.query(
      'SELECT id, name, email, phone, avatar_url, role, status, created_at FROM users WHERE id = ?',
      [studentId]
    );
    if (!userRows.length) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    const student = userRows[0];

    const [profileRows] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [studentId]
    );
    const profile = profileRows[0] || {};
    const traineeId = profile.trainee_id || `ST-2026-TR-${String(studentId).padStart(4, '0')}`;

    // Skills
    const [skills] = await pool.query(`
      SELECT s.id, s.name, s.category, ss.proficiency, ss.verified
      FROM student_skills ss
      JOIN skills s ON s.id = ss.skill_id
      WHERE ss.student_id = ?
      ORDER BY ss.verified DESC, s.name ASC
    `, [studentId]);

    // Certificates
    const [certificates] = await pool.query(`
      SELECT c.*, crs.title AS course_title
      FROM certificates c
      LEFT JOIN courses crs ON crs.id = c.course_id
      WHERE c.student_id = ?
      ORDER BY c.issue_date DESC
    `, [studentId]);

    // Projects
    const [projects] = await pool.query(`
      SELECT * FROM projects
      WHERE student_id = ?
      ORDER BY created_at DESC
    `, [studentId]);

    // Enrollments
    const [enrollments] = await pool.query(`
      SELECT e.*, c.title AS course_title, c.category, c.provider, c.duration_weeks
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [studentId]);

    // Employment Records
    const [employmentRecords] = await pool.query(`
      SELECT er.*, comp.company_name, u.name AS verified_by_name
      FROM employment_records er
      LEFT JOIN companies comp ON comp.user_id = er.company_id
      LEFT JOIN users u ON u.id = er.verified_by_user_id
      WHERE er.student_id = ?
      ORDER BY er.recorded_at DESC
    `, [studentId]);

    // Quizzes & Assessments
    const [quizAttempts] = await pool.query(`
      SELECT qa.*, cq.title AS quiz_title, c.title AS course_title
      FROM quiz_attempts qa
      JOIN course_quizzes cq ON cq.id = qa.quiz_id
      JOIN courses c ON c.id = cq.course_id
      WHERE qa.student_id = ?
      ORDER BY qa.attempted_at DESC
    `, [studentId]);

    // Calculate Employability Readiness Score
    const { calculateEmployabilityScore } = require('../utils/aiEngine');
    const readiness = calculateEmployabilityScore(profile, skills, certificates, projects, enrollments);

    res.json({
      student: {
        ...student,
        trainee_id: traineeId
      },
      profile: {
        ...profile,
        trainee_id: traineeId
      },
      skills,
      certificates,
      projects,
      enrollments,
      employmentRecords,
      quizAttempts,
      readiness
    });
  } catch (err) {
    console.error('Error fetching trainee full profile:', err);
    res.status(500).json({ error: 'Failed to retrieve complete trainee profile.' });
  }
});

module.exports = router;
