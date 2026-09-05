const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const { passport } = require('./config/passport');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const industryRoutes = require('./routes/industry');
const instituteRoutes = require('./routes/institute');
const governmentRoutes = require('./routes/government');
const publicRoutes = require('./routes/public');

const fs = require('fs');

const app = express();

// Ensure public/uploads directory exists for safe local uploads
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'skilltrack_dev_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/employer', industryRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/shared', publicRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ---------- Static frontend with anti-cache headers for HTML ----------
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Fallback to landing page for unknown non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n  SkillTrack running at http://localhost:${PORT}\n`);
});

// Scaled for high concurrent user loads (1000+ simultaneous connections)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Prevent server exit on unhandled promise rejections or errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
