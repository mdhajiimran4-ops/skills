const jwt = require('jsonwebtoken');
require('dotenv').config();

function normalizeRole(role) {
  if (!role) return '';
  const r = String(role).toLowerCase().trim();
  if (r === 'employer') return 'industry';
  return r;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, name, email }
    if (req.user && req.user.role) {
      req.user.originalRole = req.user.role;
      req.user.role = normalizeRole(req.user.role);
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function requireRole(...roles) {
  const allowed = new Set();
  for (const r of roles) {
    const norm = normalizeRole(r);
    allowed.add(norm);
    if (norm === 'industry') {
      allowed.add('employer');
      allowed.add('employee'); // Company team members can perform industry/recruiter tasks
    }
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    const userRole = normalizeRole(req.user.role);
    if (userRole === 'admin') return next();
    if (allowed.has('*') || allowed.has('any') || allowed.has('all') || roles.length === 0) {
      return next();
    }
    if (!allowed.has(userRole) && !roles.includes(req.user.role) && !roles.includes(req.user.originalRole)) {
      return res.status(403).json({ error: 'You do not have access to this feature.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, normalizeRole };
