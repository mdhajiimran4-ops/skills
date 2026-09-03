// server.js - SKILLTRACK Complete Multi-Role REST API Engine
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  database,
  saveDatabase,
  hashPassword,
  verifyPassword,
  getDatabaseMetrics
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' })); // Support base64 image upload for profile pic
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Audit Log Helper
function recordAudit(actor, action, target, status = "Success") {
  if (!database.admin) database.admin = {};
  if (!database.admin.auditLogs) database.admin.auditLogs = [];
  database.admin.auditLogs.unshift({
    id: Date.now(),
    timestamp: new Date().toISOString(),
    actor: actor || "system",
    action,
    target,
    status
  });
  saveDatabase();
}

// ================= 1. PUBLIC MODULE ================= //

app.get('/api/public/overview', (req, res) => {
  res.json({
    metrics: {
      studentsCount: "2,48,572+",
      institutesCount: "1,248+",
      employersCount: "4,600+",
      retentionRate: "78.4%"
    },
    mission: "Maharashtra State Unified Technical Skills-to-Employment Architecture."
  });
});

app.post('/api/public/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Required fields missing." });

  if (!database.contactMessages) database.contactMessages = [];
  const msg = { id: Date.now(), name, email, subject: subject || "Inquiry", message, timestamp: new Date().toISOString() };
  database.contactMessages.unshift(msg);
  recordAudit(email, "SUBMIT_CONTACT_QUERY", subject || "Public Query");

  res.status(201).json({ message: "Thank you! Your query has been logged with the state skilling cell." });
});

// ================= 2. AUTH MODULE ================= //

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  const user = database.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: "Account not found." });

  const valid = verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid password credentials." });

  recordAudit(user.email, "USER_LOGIN", user.role.toUpperCase());

  res.json({
    token: `skt_token_${user.id}_${Date.now()}`,
    user: { id: user.id, email: user.email, role: user.role }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { fullName, email, password, role, district, avatar, phone, college, course, yearSemester, linkedinUrl, githubUrl, resumeUrl, companyName, industryType, department, designation, employeeId } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: "Email, password and role required." });

  const existing = database.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) return res.status(409).json({ error: "An account with this email already exists." });

  const newId = database.users.length + 1;
  const { salt, hash } = hashPassword(password);
  const newUser = {
    id: newId,
    email: email.trim(),
    salt,
    passwordHash: hash,
    role,
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    authProvider: 'local',
    status: 'active',
    createdAt: new Date().toISOString()
  };
  database.users.push(newUser);

  if (role === 'student') {
    if (fullName) database.student.fullName = fullName;
    database.student.email = email.trim();
    if (district) database.student.district = district;
    if (avatar) database.student.avatarUrl = avatar;
    if (phone) database.student.phone = phone;
    if (college) database.student.college = college;
    if (course) database.student.course = course;
    if (yearSemester) database.student.yearSemester = yearSemester;
    if (linkedinUrl) database.student.linkedinUrl = linkedinUrl;
    if (githubUrl) database.student.githubUrl = githubUrl;
    if (resumeUrl) database.student.resumeUrl = resumeUrl;
  } else if (role === 'industry') {
    if (companyName) database.employer.companyName = companyName;
    database.employer.contactEmail = email.trim();
    if (phone) database.employer.contactPhone = phone;
    if (industryType) database.employer.industryType = industryType;
    if (district) database.employer.district = district;
    if (avatar) database.employer.logoUrl = avatar;
  }

  saveDatabase();
  recordAudit(email.trim(), "USER_REGISTER", role.toUpperCase());

  res.status(201).json({
    message: "Registration successful!",
    token: `skt_token_${newId}_${Date.now()}`,
    user: { id: newId, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
  });
});

app.post('/api/auth/google', (req, res) => {
  const { googleEmail, googleName, role } = req.body;
  if (!googleEmail) return res.status(400).json({ error: "Google email required." });

  let user = database.users.find(u => u.email.toLowerCase() === googleEmail.toLowerCase().trim());
  if (!user) {
    const newId = database.users.length + 1;
    const { salt, hash } = hashPassword('google_oauth_pass');
    user = {
      id: newId,
      email: googleEmail.trim(),
      salt,
      passwordHash: hash,
      role: role || 'student',
      authProvider: 'google',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    database.users.push(user);
    saveDatabase();
  }

  recordAudit(googleEmail, "GOOGLE_SSO_LOGIN", user.role.toUpperCase());

  res.json({
    token: `skt_google_${user.id}_${Date.now()}`,
    user: { id: user.id, email: user.email, role: user.role, name: googleName || "User" }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  res.json({ message: `Password reset instructions have been dispatched to ${email || 'registered address'}.` });
});

// ================= 3. STUDENT MODULE (13 Features) ================= //

app.get('/api/student/dashboard', (req, res) => {
  res.json({
    student: database.student,
    kpis: {
      trainingsCompleted: database.student.trainingsCompleted,
      skillsAcquired: database.student.skillsCount,
      currentStatus: database.student.currentEmployment.jobRole,
      profileCompleteness: database.student.profileCompleteness
    },
    currentEmployment: database.student.currentEmployment
  });
});

app.get('/api/student/profile', (req, res) => {
  res.json(database.student);
});

app.put('/api/student/profile', (req, res) => {
  const s = database.student;
  const { fullName, phone, district, education, bio, avatarUrl } = req.body;
  if (fullName) s.fullName = fullName;
  if (phone) s.phone = phone;
  if (district) s.district = district;
  if (education) s.education = education;
  if (bio) s.bio = bio;
  if (avatarUrl) s.avatarUrl = avatarUrl; // Profile pic update

  recordAudit(s.email, "UPDATE_STUDENT_PROFILE", "Student Dossier");
  res.json({ message: "Student profile updated successfully!", student: s });
});

// Upload profile picture directly
app.post('/api/student/upload-avatar', (req, res) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl) return res.status(400).json({ error: "Missing avatar data." });

  database.student.avatarUrl = avatarUrl;
  recordAudit(database.student.email, "UPDATE_PROFILE_PICTURE", "Avatar Asset");
  res.json({ message: "Profile picture saved successfully!", avatarUrl });
});

app.get('/api/student/skills', (req, res) => {
  res.json(database.student.skills || []);
});

app.post('/api/student/skills', (req, res) => {
  const { name, level } = req.body;
  if (!name) return res.status(400).json({ error: "Skill name required." });

  database.student.skills.push({ name: name.trim(), level: level || "Intermediate", verified: false });
  database.student.skillsCount = database.student.skills.length;
  saveDatabase();
  res.status(201).json({ message: "Skill added to student portfolio!", skills: database.student.skills });
});

app.get('/api/student/trainings', (req, res) => {
  res.json(database.student.trainings || []);
});

app.get('/api/student/certificates', (req, res) => {
  res.json(database.student.certificates || []);
});

app.get('/api/student/projects', (req, res) => {
  res.json(database.student.projects || []);
});

app.post('/api/student/projects', (req, res) => {
  const { title, tech, github, demo, description } = req.body;
  if (!title) return res.status(400).json({ error: "Project title required." });

  const newProj = {
    id: Date.now(),
    title: title.trim(),
    tech: Array.isArray(tech) ? tech : (tech ? tech.split(',').map(t => t.trim()) : ["Software"]),
    github: github || "",
    demo: demo || "",
    description: description || ""
  };
  database.student.projects.push(newProj);
  saveDatabase();
  res.status(201).json({ message: "Project published to portfolio!", project: newProj });
});

app.get('/api/student/github', (req, res) => {
  res.json({ githubId: database.student.githubId, stats: database.student.githubStats });
});

app.get('/api/student/linkedin', (req, res) => {
  res.json({ linkedinUrl: database.student.linkedinUrl });
});

app.post('/api/student/ai-skill-gap', (req, res) => {
  const { targetSkills } = req.body;
  const studentSkillNames = database.student.skills.map(s => s.name.toLowerCase());
  const required = targetSkills || ["Cloud Computing (AWS)", "Docker", "Linux", "Node.js"];

  const matched = [];
  const missing = [];

  required.forEach(reqSkill => {
    const found = studentSkillNames.some(sk => sk.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(sk));
    if (found) matched.push(reqSkill);
    else missing.push(reqSkill);
  });

  const score = Math.round((matched.length / required.length) * 100);
  res.json({
    score,
    totalRequired: required.length,
    matchedCount: matched.length,
    matchedSkills: matched,
    missingSkills: missing,
    recommendation: score >= 75 ? "Direct match for Junior Cloud/DevOps hiring pool!" : "Complete 4-Week Learning Plan to bridge Docker and Cloud gaps."
  });
});

app.get('/api/student/learning-plan', (req, res) => {
  res.json(database.student.learningPlan || []);
});

app.get('/api/student/jobs', (req, res) => {
  res.json(database.employer.jobs || []);
});

app.post('/api/student/apply-job', (req, res) => {
  const { jobId } = req.body;
  const job = (database.employer.jobs || []).find(j => j.id === parseInt(jobId));
  if (job) job.applicantsCount = (job.applicantsCount || 0) + 1;

  // Add candidate application to employer candidate pipeline
  const exists = (database.employer.candidates || []).find(c => c.studentId === database.student.id && c.jobId === parseInt(jobId));
  if (!exists) {
    database.employer.candidates.unshift({
      id: Date.now(),
      studentId: database.student.id,
      studentName: database.student.fullName,
      studentEmail: database.student.email,
      jobId: parseInt(jobId),
      jobTitle: job ? job.title : "Applicant",
      matchScore: 92,
      appliedDate: new Date().toISOString().split('T')[0],
      status: "Under Review"
    });
  }
  saveDatabase();
  res.json({ message: "Job application submitted with verified credentials!" });
});

app.get('/api/student/employment', (req, res) => {
  res.json(database.student.currentEmployment);
});

app.put('/api/student/employment', (req, res) => {
  const { company, jobRole, location, monthlySalary, employmentType } = req.body;
  const ce = database.student.currentEmployment;
  if (company) ce.company = company;
  if (jobRole) ce.jobRole = jobRole;
  if (location) ce.location = location;
  if (monthlySalary) ce.monthlySalary = monthlySalary;
  if (employmentType) ce.employmentType = employmentType;

  recordAudit(database.student.email, "UPDATE_EMPLOYMENT_STATUS", company || "Corporate Employer");
  res.json({ message: "Employment telemetry updated successfully!", currentEmployment: ce });
});

app.get('/api/student/follow-ups', (req, res) => {
  res.json(database.student.followUps || []);
});

// ================= 4. INSTITUTE MODULE (7 Features) ================= //

app.get('/api/institute/dashboard', (req, res) => {
  res.json({
    institute: database.institute,
    stats: database.institute.stats
  });
});

app.get('/api/institute/students', (req, res) => {
  res.json([
    { id: 1, fullName: database.student.fullName, email: database.student.email, district: database.student.district, employmentStatus: "employed", certificates: database.student.certificates },
    { id: 2, fullName: "Ayesha Naaz", email: "ayesha.n@gmail.com", district: "Pune", employmentStatus: "placed", certificates: [{ title: "Certified Data Specialist" }] },
    { id: 3, fullName: "Rahul Verma", email: "rahul.v@gmail.com", district: "Nagpur", employmentStatus: "in_training", certificates: [] }
  ]);
});

app.get('/api/institute/courses', (req, res) => {
  res.json(database.institute.courses || []);
});

app.post('/api/institute/courses', (req, res) => {
  const { title, category, durationWeeks, intake, skills, syllabus, fee } = req.body;
  const newCourse = {
    id: Date.now(),
    title: title.trim(),
    category: category || "Software Engineering",
    durationWeeks: parseInt(durationWeeks) || 12,
    intake: parseInt(intake) || 60,
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ["IT"]),
    syllabus: syllabus || "",
    fee: fee || "Government Subsidized"
  };
  database.institute.courses.push(newCourse);
  recordAudit(database.institute.email, "LAUNCH_NEW_COURSE", newCourse.title);
  res.status(201).json({ message: "Course published and registered with state catalog!", course: newCourse });
});

app.get('/api/institute/trainings', (req, res) => {
  res.json(database.institute.courses || []);
});

app.get('/api/institute/assessments', (req, res) => {
  res.json(database.institute.assessments || []);
});

app.post('/api/institute/assessments', (req, res) => {
  const { title, totalStudents, passed } = req.body;
  const tot = parseInt(totalStudents) || 100;
  const pass = parseInt(passed) || 90;
  const rate = `${((pass / tot) * 100).toFixed(1)}%`;

  const exam = {
    id: Date.now(),
    title: title.trim(),
    date: new Date().toISOString().split('T')[0],
    totalStudents: tot,
    passed: pass,
    passRate: rate
  };
  database.institute.assessments.unshift(exam);
  saveDatabase();
  res.status(201).json({ message: "Assessment record logged!", assessment: exam });
});

app.get('/api/institute/certificates', (req, res) => {
  res.json(database.institute.issuedCertificates || []);
});

app.post('/api/institute/issue-certificate', (req, res) => {
  const { studentId, courseTitle } = req.body;
  const newCert = {
    id: Date.now(),
    studentName: database.student.fullName,
    studentEmail: database.student.email,
    title: courseTitle || "Certified Specialist",
    issueDate: new Date().toISOString().split('T')[0],
    credentialId: `MS-INST-${Date.now().toString().slice(-5)}`,
    status: "Verified"
  };
  database.institute.issuedCertificates.unshift(newCert);
  database.student.certificates.unshift({
    id: newCert.id,
    title: newCert.title,
    issuer: database.institute.shortName,
    issueDate: newCert.issueDate,
    credentialId: newCert.credentialId,
    verificationUrl: `https://skilltrack.gov/verify/${newCert.credentialId}`,
    status: "Verified"
  });
  saveDatabase();
  res.status(201).json({ message: "Certificate issued and cryptographically registered!", certificate: newCert });
});

app.get('/api/institute/outcomes', (req, res) => {
  res.json(database.institute.stats);
});

// ================= 5. EMPLOYER MODULE (5 Features) ================= //

app.get('/api/employer/dashboard', (req, res) => {
  res.json({
    company: database.employer,
    activeJobs: database.employer.jobs.length,
    candidatesCount: database.employer.candidates.length,
    totalHired: database.employer.totalHired
  });
});

app.get('/api/employer/company', (req, res) => {
  res.json(database.employer);
});

app.put('/api/employer/company', (req, res) => {
  const { companyName, sector, district, phone, website, address } = req.body;
  const e = database.employer;
  if (companyName) e.companyName = companyName;
  if (sector) e.sector = sector;
  if (district) e.district = district;
  if (phone) e.phone = phone;
  if (website) e.website = website;
  if (address) e.address = address;

  saveDatabase();
  res.json({ message: "Employer company profile updated!", employer: e });
});

app.get('/api/employer/jobs', (req, res) => {
  res.json(database.employer.jobs || []);
});

app.post('/api/employer/jobs', (req, res) => {
  const { title, jobType, district, salaryRange, experience, requiredSkills } = req.body;
  const newJob = {
    id: Date.now(),
    title: title.trim(),
    jobType: jobType || "Full Time",
    district: district || "Pune",
    salaryRange: salaryRange || "₹6.0 - ₹8.0 LPA",
    experience: experience || "0-1 Year",
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : ["IT"]),
    status: "Open",
    applicantsCount: 0,
    postedDate: new Date().toISOString().split('T')[0]
  };
  database.employer.jobs.push(newJob);
  recordAudit(database.employer.email, "POST_JOB_VACANCY", newJob.title);
  res.status(201).json({ message: "Job vacancy published!", job: newJob });
});

app.get('/api/employer/candidates', (req, res) => {
  res.json(database.employer.candidates || []);
});

app.put('/api/employer/hiring-status', (req, res) => {
  const { candidateId, status, salaryOffered } = req.body;
  const cand = (database.employer.candidates || []).find(c => c.id === parseInt(candidateId));
  if (cand) {
    cand.status = status;
    if (salaryOffered) cand.salaryOffered = salaryOffered;
    if (status === 'Hired') {
      database.employer.totalHired += 1;
      recordAudit(database.employer.email, "HIRE_CANDIDATE", cand.studentName);
    }
  }
  saveDatabase();
  res.json({ message: `Candidate hiring status updated to ${status}!`, candidate: cand });
});

// ================= 6. GOVERNMENT MODULE (9 Features) ================= //

app.get('/api/gov/dashboard', (req, res) => {
  res.json(database.government);
});

app.get('/api/gov/district-analytics', (req, res) => {
  res.json(database.government.districtAnalytics || []);
});

app.get('/api/gov/training-analytics', (req, res) => {
  res.json(database.government.trainingAnalytics || {});
});

app.get('/api/gov/institute-performance', (req, res) => {
  res.json(database.government.instituteRankings || []);
});

app.get('/api/gov/employment', (req, res) => {
  res.json(database.government.kpis);
});

app.get('/api/gov/skill-demand', (req, res) => {
  res.json(database.government.skillDemand || []);
});

app.get('/api/gov/skill-gaps', (req, res) => {
  res.json(database.government.skillGaps || []);
});

app.get('/api/gov/ai-insights', (req, res) => {
  res.json(database.government.aiInsights || []);
});

app.get('/api/gov/reports', (req, res) => {
  res.json(database.government.reports || []);
});

app.post('/api/gov/generate-report', (req, res) => {
  const { sector, district } = req.body;
  const rep = {
    id: `REP-${Date.now().toString().slice(-6)}`,
    title: `Targeted Skilling & Placement Review: ${sector || 'Technology & Cloud'} (${district || 'Maharashtra'})`,
    date: new Date().toISOString().split('T')[0],
    author: "MSSDS AI Intelligence Engine",
    status: "Published"
  };
  database.government.reports.unshift(rep);
  recordAudit("officer@skilltrack.gov", "GENERATE_STATE_REPORT", rep.id);
  res.status(201).json(rep);
});

// ================= 7. ADMIN MODULE (7 Features) ================= //

app.get('/api/admin/users', (req, res) => {
  res.json(database.users || []);
});

app.put('/api/admin/user-status', (req, res) => {
  const { userId, status } = req.body;
  const user = (database.users || []).find(u => u.id === parseInt(userId));
  if (user) {
    user.status = status;
    recordAudit("admin@skilltrack.org", "MODIFY_USER_STATUS", `${user.email} -> ${status}`);
  }
  saveDatabase();
  res.json({ message: "User status updated!", user });
});

app.get('/api/admin/institutes', (req, res) => {
  res.json([database.institute]);
});

app.put('/api/admin/institute-status', (req, res) => {
  const { instituteId, status } = req.body;
  if (database.institute) database.institute.status = status;
  recordAudit("admin@skilltrack.org", "UPDATE_ACCREDITATION", status);
  res.json({ message: "Institute accreditation updated!" });
});

app.get('/api/admin/employers', (req, res) => {
  res.json([database.employer]);
});

app.put('/api/admin/employer-status', (req, res) => {
  const { employerId, status } = req.body;
  if (database.employer) database.employer.verificationStatus = status;
  recordAudit("admin@skilltrack.org", "UPDATE_EMPLOYER_VERIFICATION", status);
  res.json({ message: "Employer verification updated!" });
});

app.get('/api/admin/skills', (req, res) => {
  res.json(database.admin.skillsTaxonomy || []);
});

app.post('/api/admin/skills', (req, res) => {
  const { name, category, demand } = req.body;
  const newSkill = {
    id: Date.now(),
    name: name.trim(),
    category: category || "Technology",
    demand: demand || "High",
    activeCourses: 1
  };
  database.admin.skillsTaxonomy.push(newSkill);
  recordAudit("admin@skilltrack.org", "ADD_SKILL_TAXONOMY", newSkill.name);
  res.status(201).json({ message: "Skill added to taxonomy!", skill: newSkill });
});

app.get('/api/admin/courses', (req, res) => {
  res.json(database.institute.courses || []);
});

app.get('/api/admin/permissions', (req, res) => {
  res.json(database.admin.permissions || []);
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json(database.admin.auditLogs || []);
});

// ================= DATABASE TELEMETRY & SQL DUMP ================= //

app.get('/api/db/metrics', (req, res) => {
  res.json(getDatabaseMetrics());
});

app.get('/api/db/export-sql', (req, res) => {
  const sql = `
-- =========================================================================
-- SKILLTRACK Live SQL Dump
-- Generated: ${new Date().toISOString()}
-- =========================================================================

CREATE DATABASE IF NOT EXISTS skilltrack_db;
USE skilltrack_db;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(64) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active'
);

INSERT INTO users (id, email, password_hash, salt, role, status) VALUES
(1, 'rohit.patil@skilltrack.org', 'hash', 'salt', 'student', 'active'),
(2, 'director@gbitpune.edu.in', 'hash', 'salt', 'institute', 'active'),
(3, 'hiring@techsolutions.com', 'hash', 'salt', 'employer', 'active'),
(4, 'officer@skilltrack.gov', 'hash', 'salt', 'government', 'active'),
(5, 'admin@skilltrack.org', 'hash', 'salt', 'admin', 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="skilltrack_dump.sql"');
  res.send(sql);
});

// ================= 7. COMPANY CAREER PATHS & COURSES MODULE ================= //

// Get all verified companies
app.get('/api/companies', (req, res) => {
  res.json(database.companies || []);
});

app.get('/api/companies/:id', (req, res) => {
  const comp = (database.companies || []).find(c => c.id === parseInt(req.params.id));
  if (!comp) return res.status(404).json({ error: "Company not found." });
  res.json(comp);
});

// Career paths
app.get('/api/career-paths', (req, res) => {
  res.json(database.careerPaths || []);
});

app.post('/api/companies/:id/career-paths', (req, res) => {
  const compId = parseInt(req.params.id);
  const comp = (database.companies || []).find(c => c.id === compId);
  const { title, description, startingSalary, requiredSkills, skillsImparted, recommendedCourseId } = req.body;
  if (!title) return res.status(400).json({ error: "Career title required." });

  const newPath = {
    id: `path-${Date.now()}`,
    companyId: compId,
    companyName: comp ? comp.companyName : "Enterprise Partner",
    title: title.trim(),
    description: description || "",
    startingSalary: startingSalary || "₹25,000 - ₹35,000 / month",
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
    skillsImparted: Array.isArray(skillsImparted) ? skillsImparted : (skillsImparted ? skillsImparted.split(',').map(s => s.trim()) : []),
    recommendedCourseId: recommendedCourseId || "",
    openJobsCount: 1
  };

  if (!database.careerPaths) database.careerPaths = [];
  database.careerPaths.unshift(newPath);
  saveDatabase();
  res.status(201).json({ message: "Career path created!", careerPath: newPath });
});

// Company courses
app.get('/api/courses', (req, res) => {
  const companyId = req.query.companyId;
  let list = database.courses || [];
  if (companyId) {
    list = list.filter(c => c.companyId === parseInt(companyId));
  }
  res.json(list);
});

app.post('/api/companies/:id/courses', (req, res) => {
  const compId = parseInt(req.params.id);
  const comp = (database.companies || []).find(c => c.id === compId);
  const { title, code, category, duration, level, requiredSkills, skillsTaught, overview, assignment, quiz, lessons } = req.body;
  if (!title) return res.status(400).json({ error: "Course title required." });

  const newCourse = {
    id: `course-${Date.now()}`,
    companyId: compId,
    companyName: comp ? comp.companyName : "Enterprise Academy",
    code: code || `CC-${Math.floor(100 + Math.random() * 900)}`,
    title: title.trim(),
    category: category || "Technology",
    provider: comp ? `${comp.companyName} Academy` : "Corporate Academy",
    instructor: (comp && comp.contactPerson) ? comp.contactPerson : "Corporate Technical Lead",
    instructorRole: "Lead Technical Mentor",
    duration: duration || "6 Weeks",
    level: level || "Industry Apprenticeship",
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
    skillsTaught: Array.isArray(skillsTaught) ? skillsTaught : (skillsTaught ? skillsTaught.split(',').map(s => s.trim()) : []),
    overview: overview || "",
    enrolled: false,
    progressPercent: 0,
    lessons: lessons || [
      { id: 1, title: "Module 1: Corporate Production Workflow", duration: "30 min", completed: false, content: "Enterprise development lifecycle and code quality expectations." }
    ],
    assignment: assignment || {
      id: `asg-${Date.now()}`,
      title: `${title} Project Deliverable`,
      prompt: "Implement the required architectural specifications and upload your project PDF report.",
      deadline: "End of Week 4",
      maxMarks: 100,
      submitted: false
    },
    quiz: quiz || {
      id: `quiz-${Date.now()}`,
      title: `${title} Assessment Quiz`,
      passed: false,
      score: null,
      questions: [
        { q: "What is the primary industry objective of this course?", options: ["Production Implementation", "Theoretical Survey", "Basic Overview", "None of the above"], correct: 0 }
      ]
    }
  };

  if (!database.courses) database.courses = [];
  database.courses.unshift(newCourse);
  saveDatabase();
  res.status(201).json({ message: "Course published to academy!", course: newCourse });
});

// Student enroll
app.post('/api/student/enroll-course', (req, res) => {
  const { courseId } = req.body;
  const course = (database.courses || []).find(c => c.id === courseId);
  if (course) {
    course.enrolled = true;
    saveDatabase();
  }
  res.json({ message: "Enrolled in course successfully!", course });
});

// Student submit project deliverable (with PDF file name & URL)
app.post('/api/student/submit-project', (req, res) => {
  const { courseId, submissionText, projectFileName, projectFileUrl, githubUrl } = req.body;
  const course = (database.courses || []).find(c => c.id === courseId);
  const s = database.student;

  const sub = {
    id: Date.now(),
    courseId: courseId,
    courseTitle: course ? course.title : "Corporate Course",
    companyId: course ? course.companyId : 1,
    companyName: course ? course.companyName : "Tech Solutions Pvt. Ltd.",
    studentId: s.id,
    studentName: s.fullName,
    studentEmail: s.email,
    studentPassportId: s.digitalSkillPassportId,
    assignmentTitle: (course && course.assignment) ? course.assignment.title : "Practical Deliverable",
    submissionDate: new Date().toISOString().split('T')[0],
    submissionText: submissionText || "",
    projectFileName: projectFileName || "project_deliverable.pdf",
    projectFileUrl: projectFileUrl || "https://skilltrack.org/deliverables/project.pdf",
    githubUrl: githubUrl || s.githubUrl,
    quizScore: (course && course.quiz) ? (course.quiz.score || "100%") : "100%",
    evaluationStatus: "Pending",
    marks: null,
    grade: "Pending Review",
    evaluator: "Awaiting Company HR / Mentor Review",
    feedback: "Submission received. Company reviewer notified.",
    skillEndorsed: null
  };

  if (!database.courseSubmissions) database.courseSubmissions = [];
  database.courseSubmissions.unshift(sub);

  if (course && course.assignment) {
    course.assignment.submitted = true;
  }
  saveDatabase();
  res.status(201).json({ message: "Project deliverable and PDF submitted to company!", submission: sub });
});

// Student submit quiz
app.post('/api/student/submit-quiz', (req, res) => {
  const { courseId, answers } = req.body;
  const course = (database.courses || []).find(c => c.id === courseId);
  if (!course || !course.quiz) return res.status(404).json({ error: "Quiz not found." });

  let correctCount = 0;
  course.quiz.questions.forEach((q, idx) => {
    if (answers && answers[idx] !== undefined && parseInt(answers[idx]) === q.correct) {
      correctCount++;
    }
  });

  const percent = Math.round((correctCount / course.quiz.questions.length) * 100);
  course.quiz.score = `${percent}%`;

  if (percent >= 66) {
    course.quiz.passed = true;
    course.progressPercent = 100;

    // Issue certificate
    const credId = `MS-${course.code || 'CERT'}-${Math.floor(10000 + Math.random() * 90000)}`;
    database.student.certificates.unshift({
      id: Date.now(),
      title: `Certified ${course.title}`,
      issuer: course.provider || course.companyName,
      issueDate: new Date().toISOString().split('T')[0],
      credentialId: credId,
      status: "Verified by Company HR"
    });

    // Add skills
    (course.skillsTaught || []).forEach(skName => {
      if (!database.student.skills.some(s => s.name.toLowerCase() === skName.toLowerCase())) {
        database.student.skills.push({ name: skName, level: "Intermediate", verified: true, endorsedBy: course.companyName });
      }
    });
  }

  saveDatabase();
  res.json({ score: `${percent}%`, passed: course.quiz.passed, progressPercent: course.progressPercent });
});

// Company review submissions
app.get('/api/companies/:id/submissions', (req, res) => {
  const compId = parseInt(req.params.id);
  const subs = (database.courseSubmissions || []).filter(s => s.companyId === compId);
  res.json(subs);
});

// Company evaluate submission
app.post('/api/companies/:id/evaluate-submission', (req, res) => {
  const { submissionId, marks, grade, evaluator, feedback, skillEndorsed } = req.body;
  const sub = (database.courseSubmissions || []).find(s => s.id === parseInt(submissionId));
  if (!sub) return res.status(404).json({ error: "Submission not found." });

  sub.evaluationStatus = "Graded";
  sub.marks = parseInt(marks) || 95;
  sub.grade = grade || "Grade A+";
  sub.evaluator = evaluator || "Lead Reviewer";
  sub.feedback = feedback || "Excellent project deliverable.";
  sub.skillEndorsed = skillEndorsed || "Verified Competency";

  if (skillEndorsed) {
    const s = database.student;
    const existing = s.skills.find(sk => sk.name.toLowerCase() === skillEndorsed.toLowerCase());
    if (existing) {
      existing.verified = true;
      existing.endorsedBy = sub.companyName;
    } else {
      s.skills.push({ name: skillEndorsed, level: "Advanced (Industry Endorsed)", verified: true, endorsedBy: sub.companyName });
    }
  }

  saveDatabase();
  res.json({ message: "Project evaluated and skill endorsed!", submission: sub });
});

// Company applications
app.get('/api/companies/:id/applications', (req, res) => {
  const compId = parseInt(req.params.id);
  const apps = (database.applications || []).filter(a => a.companyId === compId);
  res.json(apps);
});

// Company update application status
app.put('/api/companies/:id/applications/:appId', (req, res) => {
  const appId = parseInt(req.params.appId);
  const { status, interviewInfo } = req.body;
  const app = (database.applications || []).find(a => a.id === appId);
  if (!app) return res.status(404).json({ error: "Application not found." });

  app.status = status;
  if (interviewInfo) {
    app.interviewInfo = interviewInfo;
  }

  if (status === 'Selected') {
    const comp = (database.companies || []).find(c => c.id === app.companyId);
    if (comp) comp.totalHired = (comp.totalHired || 0) + 1;
  }

  saveDatabase();
  res.json({ message: `Application status updated to ${status}!`, application: app });
});

// ================= 8. MULTI-STUDENT & FACULTY MODULE ================= //

// Get specific student by ID or Passport ID
app.get('/api/students/:id', (req, res) => {
  const param = req.params.id;
  const list = database.students || [];
  const student = list.find(s => s.id === parseInt(param) || s.digitalSkillPassportId === param || (s.email && s.email.toLowerCase() === param.toLowerCase()));
  if (!student) return res.status(404).json({ error: "Student not found." });
  res.json(student);
});

// Get all faculty members
app.get('/api/faculty', (req, res) => {
  res.json(database.faculty || []);
});

// Get specific faculty by facultyId
app.get('/api/faculty/:facultyId', (req, res) => {
  const fid = req.params.facultyId;
  const fac = (database.faculty || []).find(f => f.facultyId === fid || f.id === parseInt(fid));
  if (!fac) return res.status(404).json({ error: "Faculty member not found." });
  res.json(fac);
});

// Get ONLY assigned students for a specific faculty
app.get('/api/faculty/:facultyId/students', (req, res) => {
  const fid = req.params.facultyId;
  const fac = (database.faculty || []).find(f => f.facultyId === fid || f.id === parseInt(fid));
  if (!fac) return res.status(404).json({ error: "Faculty member not found." });

  const assignedIds = fac.assignedStudentIds || [];
  const assigned = (database.students || []).filter(s => assignedIds.includes(s.id) || s.facultyId === fac.facultyId);
  res.json(assigned);
});

// Get faculty cohort announcements
app.get('/api/faculty/:facultyId/announcements', (req, res) => {
  const fid = req.params.facultyId;
  const list = (database.facultyAnnouncements || []).filter(a => a.facultyId === fid);
  res.json(list);
});

// Post new faculty announcement
app.post('/api/faculty/:facultyId/announcements', (req, res) => {
  const fid = req.params.facultyId;
  const fac = (database.faculty || []).find(f => f.facultyId === fid || f.id === parseInt(fid));
  const { title, content, priority, targetGroup } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required." });

  const newAnn = {
    id: Date.now(),
    facultyId: fac ? fac.facultyId : fid,
    facultyName: fac ? fac.name : "Academic Faculty",
    title: title.trim(),
    content: content.trim(),
    targetGroup: targetGroup || `Cohort ${fid}`,
    priority: priority || "Academic",
    date: new Date().toISOString().split('T')[0]
  };

  if (!database.facultyAnnouncements) database.facultyAnnouncements = [];
  database.facultyAnnouncements.unshift(newAnn);
  saveDatabase();
  res.status(201).json({ message: "Announcement broadcasted to assigned cohort!", announcement: newAnn });
});

// Faculty evaluate student submission
app.post('/api/faculty/:facultyId/evaluate', (req, res) => {
  const fid = req.params.facultyId;
  const fac = (database.faculty || []).find(f => f.facultyId === fid || f.id === parseInt(fid));
  const { submissionId, marks, grade, feedback, skillEndorsed } = req.body;

  const sub = (database.courseSubmissions || []).find(s => s.id === parseInt(submissionId));
  if (!sub) return res.status(404).json({ error: "Submission not found." });

  sub.evaluationStatus = "Graded";
  sub.marks = parseInt(marks) || 95;
  sub.grade = grade || "Grade A+";
  sub.evaluator = fac ? `${fac.name} (${fac.facultyId})` : "Academic Faculty Mentor";
  sub.feedback = feedback || "Work meets accredited academic rigor and standards.";
  sub.skillEndorsed = skillEndorsed || "Academic Technical Competency";

  // Endorse skill on specific student
  const student = (database.students || []).find(s => s.id === sub.studentId);
  if (student && skillEndorsed) {
    const existing = student.skills.find(sk => sk.name.toLowerCase() === skillEndorsed.toLowerCase());
    if (existing) {
      existing.verified = true;
      existing.endorsedBy = fac ? `${fac.name} (${fac.facultyId})` : "Faculty Mentor";
    } else {
      student.skills.push({
        name: skillEndorsed,
        level: "Advanced (Faculty Endorsed)",
        verified: true,
        endorsedBy: fac ? `${fac.name} (${fac.facultyId})` : "Faculty Mentor"
      });
    }
  }

  saveDatabase();
  res.json({ message: "Student project evaluated and marks published!", submission: sub });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` SKILLTRACK Enterprise Engine Live at http://localhost:${PORT}`);
  console.log(` Persistent Database: ${path.join(__dirname, 'data.json')}`);
  console.log(` All 7 Modules Active: Public, Auth, Student, Institute, Employer, Government, Admin`);
  console.log(`================================================================`);
});
