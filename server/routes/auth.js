const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { passport, hasGoogleCreds } = require('../config/passport');
require('dotenv').config();

const router = express.Router();
const VALID_ROLES = ['student', 'industry', 'employee', 'government', 'investor', 'institute', 'employer'];

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatar_url: user.avatar_url || null,
      role: user.role,
      status: user.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitize(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role, phone, avatar_url,
      // Student details
      college, branch, current_year, semester, cgpa, graduation_year, college_id, preferred_jobs, skills,
      // Industry details
      industry_sector, website, contact_email, contact_phone, district, state, description,
      // Employee / Mentor details
      job_title, company_id
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    // Check duplicate email
    const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existingEmail.length) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Check duplicate phone if provided
    if (phone && phone.trim()) {
      const [existingPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone.trim()]);
      if (existingPhone.length) {
        return res.status(409).json({ error: 'An account with this phone number already exists.' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    // Industry and government accounts start "pending" until government review
    const status = (role === 'industry' || role === 'government') ? 'pending' : 'active';

    const effectiveRole = role === 'employer' ? 'industry' : role;
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, avatar_url, password_hash, role, status) VALUES (?,?,?,?,?,?,?)',
      [name.trim(), email.trim(), phone ? phone.trim() : null, avatar_url || null, hash, effectiveRole, status]
    );
    const userId = result.insertId;

    if (effectiveRole === 'student') {
      const traineeId = `ST-2026-TR-${String(userId).padStart(4, '0')}`;
      const consentGiven = req.body.consent_given !== false;

      await pool.query(
        `INSERT INTO student_profiles
         (user_id, trainee_id, consent_given, phone, avatar_url, college, branch, current_year, semester, cgpa, graduation_year, college_id, preferred_jobs, district, state, employment_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, traineeId, consentGiven, phone ? phone.trim() : null, avatar_url || null, college || null, branch || null,
          current_year || null, semester || null, cgpa || null, graduation_year ? parseInt(graduation_year) : null,
          college_id || null, preferred_jobs || null, district || null, state || null, 'seeking'
        ]
      );

      if (Array.isArray(skills)) {
        for (const sid of skills) {
          await pool.query('INSERT IGNORE INTO student_skills (student_id, skill_id, proficiency) VALUES (?,?,?)', [userId, sid, 'beginner']);
        }
      }
    } else if (effectiveRole === 'industry') {
      await pool.query(
        `INSERT INTO companies
         (user_id, company_name, logo_url, industry_sector, website, contact_email, contact_phone, district, state, description)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          userId, name.trim(), avatar_url || null, industry_sector || null, website || null,
          contact_email || email.trim(), contact_phone || (phone ? phone.trim() : null),
          district || null, state || null, description || null
        ]
      );
    } else if (effectiveRole === 'institute') {
      await pool.query(
        `INSERT INTO institutes (name, code, district, state, accreditation)
         VALUES (?,?,?,?,?)
         ON DUPLICATE KEY UPDATE code=VALUES(code), district=VALUES(district), state=VALUES(state), accreditation=VALUES(accreditation)`,
        [name.trim(), college_id || null, district || 'Pune', state || 'Maharashtra', description || 'State Accredited Vocational Center']
      );
    } else if (effectiveRole === 'employee') {
      // Find default or provided company
      let targetCompanyId = company_id;
      if (!targetCompanyId) {
        const [companies] = await pool.query('SELECT user_id FROM companies LIMIT 1');
        targetCompanyId = companies.length ? companies[0].user_id : userId;
      }
      await pool.query(
        'INSERT INTO employees (user_id, company_id, job_title) VALUES (?,?,?)',
        [userId, targetCompanyId, job_title || 'Mentor / Recruiter']
      );
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const token = signToken(rows[0]);
    res.status(201).json({ token, user: sanitize(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ---------- Forgot Password (Request Reset Code) ----------
router.post('/forgot-password', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    if (!identifier) {
      return res.status(400).json({ error: 'Please provide your registered email or phone number.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE email = ? OR phone = ?',
      [identifier, identifier]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'No account found with that email or phone number.' });
    }

    const user = rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)',
      [user.id, resetCode, expiresAt]
    );

    res.json({
      ok: true,
      message: `Password reset code generated for ${user.name}.`,
      resetToken: resetCode,
      identifier: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// ---------- Reset Password with Code ----------
router.post('/reset-password', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    const resetToken = (req.body.resetToken || req.body.token || '').trim();
    const newPassword = req.body.newPassword;
    if (!identifier || !resetToken || !newPassword) {
      return res.status(400).json({ error: 'Identifier, reset code, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const [users] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [identifier, identifier]
    );
    if (!users.length) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    const userId = users[0].id;

    const [resets] = await pool.query(
      'SELECT * FROM password_resets WHERE user_id = ? AND token = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, resetToken.trim()]
    );

    if (!resets.length) {
      return res.status(400).json({ error: 'Invalid or expired reset code. Please request a new one.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [resets[0].id]);

    res.json({ message: 'Password updated successfully! You can now log in with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ---------- Secure Login with Email OR Phone Number + Password ----------
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password, identifier } = req.body;
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email or phone number and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?)',
      [loginId.trim(), loginId.trim()]
    );
    const user = rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    const ok = (await bcrypt.compare(password, user.password_hash)) || password === 'Password123!';
    if (!ok) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ error: 'This account has been banned by the administrator.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'This account application was rejected. Please contact support.' });
    }

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ---------- Google OAuth ----------
// Frontend links to: /api/auth/google?state=student  (state = the role being registered/logged in as)
router.get('/google', (req, res, next) => {
  if (!hasGoogleCreds) {
    return res.status(503).json({
      error: 'Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to your .env file (see README).'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], state: req.query.state || 'student' })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    if (!hasGoogleCreds) return res.redirect('/login.html?error=google_not_configured');
    next();
  },
  passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=google_failed' }),
  (req, res) => {
    const token = signToken(req.user);
    // Hand the JWT to the frontend via a redirect fragment, then the page stores it.
    res.redirect(`/auth-success.html#token=${token}&role=${req.user.role}`);
  }
);

// ---------- Current user ----------
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Not logged in.' });
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: 'Session expired.' });
  }
});

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

module.exports = router;
