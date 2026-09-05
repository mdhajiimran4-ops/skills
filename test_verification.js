const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== SKILLTRACK COMPLETE VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. AUTH LOGINS
  console.log('[1] Testing Authentication & Roles:');
  const roles = [
    { email: 'student@demo.com', role: 'student' },
    { email: 'institute@demo.com', role: 'institute' },
    { email: 'industry@demo.com', role: 'industry' },
    { email: 'gov@demo.com', role: 'government' }
  ];

  const tokens = {};

  for (const r of roles) {
    const res = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: r.email, password: 'Password123!' });

    assert(res.status === 200 && res.body?.token, `Login successful for ${r.role} (${r.email})`);
    if (res.body?.token) {
      tokens[r.role] = res.body.token;
      assert(res.body.user.role === r.role, `User object returns expected role '${r.role}'`);
    }
  }

  // Forgot Password flow
  const forgotRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@demo.com' });
  assert(forgotRes.status === 200 && forgotRes.body?.ok, 'Forgot password request generated reset code');

  // 2. STUDENT AI INTELLIGENCE & AVATAR LIFECYCLE
  console.log('\n[2] Testing Student Features & AI Skill Intelligence Engine:');
  const studentHeaders = {
    'Authorization': `Bearer ${tokens.student}`,
    'Content-Type': 'application/json'
  };

  // Feature 1: Trainee ID & Consent Profile Verification
  const studentProfileRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/profile',
    method: 'GET',
    headers: studentHeaders
  });
  assert(studentProfileRes.status === 200 && /^ST-2026-TR-\d{4}$/.test(studentProfileRes.body?.profile?.trainee_id), `Student profile returns unique Trainee ID (${studentProfileRes.body?.profile?.trainee_id})`);
  assert(studentProfileRes.body?.profile?.consent_given === 1 || studentProfileRes.body?.profile?.consent_given === true, 'Student profile maintains consent-based workforce tracking status');

  const consentToggleRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/consent',
    method: 'PUT',
    headers: studentHeaders
  }, { consent: true });
  assert(consentToggleRes.status === 200 && consentToggleRes.body?.ok && consentToggleRes.body?.consent_given === true, 'Student can toggle workforce tracking consent with audit timestamps');

  // Avatar removal
  const avatarRemoveRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/profile/avatar/remove',
    method: 'POST',
    headers: studentHeaders
  });
  assert(avatarRemoveRes.status === 200 && avatarRemoveRes.body?.avatar_url === null, 'Avatar removed successfully (nulls out avatar_url for initials fallback)');

  // AI Target roles
  const targetRolesRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/ai/target-roles',
    method: 'GET',
    headers: studentHeaders
  });
  assert(targetRolesRes.status === 200 && Array.isArray(targetRolesRes.body?.roles) && targetRolesRes.body.roles.length >= 8, 'Returns canonical AI target roles list');

  // AI Target role skill gap analysis
  const gapRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/ai/analyze-target-role',
    method: 'POST',
    headers: studentHeaders
  }, { target_role: 'Full Stack Developer' });
  assert(gapRes.status === 200 && typeof gapRes.body?.matchPercentage === 'number', `AI skill gap analysis computed match percentage (${gapRes.body?.matchPercentage}%)`);
  assert(Array.isArray(gapRes.body?.matchedSkills) && Array.isArray(gapRes.body?.missingSkills), 'AI returned matched and missing skills');
  assert(gapRes.body?.employabilityReadiness?.disclaimer === 'A readiness indicator, not a guarantee of employment.', 'Employability score includes mandatory disclaimer: "A readiness indicator, not a guarantee of employment."');

  // AI Personalized Learning Plan
  const planRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/learning-plan?targetRole=' + encodeURIComponent('Full Stack Developer'),
    method: 'GET',
    headers: studentHeaders
  });
  assert(planRes.status === 200 && Array.isArray(planRes.body?.roadmap) && planRes.body.roadmap.length === 5, 'Personalized learning plan generates 5-step roadmap');
  assert(Array.isArray(planRes.body?.recommendedProjects) && planRes.body.recommendedProjects.length > 0, 'Personalized learning plan includes recommended project blueprints');
  assert(Array.isArray(planRes.body?.certifications) && planRes.body.certifications.length > 0, 'Personalized learning plan includes industry certifications');

  // Student certificates CRUD
  const certAddRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/certificates',
    method: 'POST',
    headers: studentHeaders
  }, {
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issue_date: '2026-01-15',
    credential_id: 'AWS-987654321',
    credential_url: 'https://aws.amazon.com/verify'
  });
  assert(certAddRes.status === 201 && certAddRes.body?.certificate?.id, 'Student can self-add certificates');
  const createdCertId = certAddRes.body?.certificate?.id;

  if (createdCertId) {
    const certDelRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/student/certificates/${createdCertId}`,
      method: 'DELETE',
      headers: studentHeaders
    });
    assert(certDelRes.status === 200 && certDelRes.body?.ok, 'Student can delete self-added certificate');
  }

  // Student Notifications
  const notifRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/notifications',
    method: 'GET',
    headers: studentHeaders
  });
  assert(notifRes.status === 200 && Array.isArray(notifRes.body?.notifications), 'Student can fetch notifications');

  // 3. INSTITUTE DASHBOARD APIS
  console.log('\n[3] Testing Institute Endpoints:');
  const instituteHeaders = {
    'Authorization': `Bearer ${tokens.institute}`,
    'Content-Type': 'application/json'
  };

  const instOverview = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/institute/stats/overview',
    method: 'GET',
    headers: instituteHeaders
  });
  assert(instOverview.status === 200 && instOverview.body?.totalStudents !== undefined, 'Institute overview returns statistics');

  const instStudents = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/institute/students',
    method: 'GET',
    headers: instituteHeaders
  });
  assert(instStudents.status === 200 && Array.isArray(instStudents.body?.students), 'Institute can fetch student registry');

  // Attendance registry
  const instAttendanceGet = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/institute/attendance?date=' + new Date().toISOString().split('T')[0],
    method: 'GET',
    headers: instituteHeaders
  });
  assert(instAttendanceGet.status === 200 && Array.isArray(instAttendanceGet.body?.attendance), 'Institute can query daily attendance');

  if (instStudents.body?.students?.length > 0) {
    const firstStudentId = instStudents.body.students[0].id || instStudents.body.students[0].student_id;
    const instAttendancePost = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/institute/attendance',
      method: 'POST',
      headers: instituteHeaders
    }, {
      attendance_date: new Date().toISOString().split('T')[0],
      records: [{ student_id: firstStudentId, status: 'present', notes: 'Automated test check-in' }]
    });
    assert(instAttendancePost.status === 200 && instAttendancePost.body?.ok, 'Institute can record daily student attendance');

    // Issue Certificate
    const issueCertRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/institute/certificates/issue',
      method: 'POST',
      headers: instituteHeaders
    }, {
      student_id: firstStudentId,
      title: 'Certified Full Stack Web Specialist',
      credential_id: 'INST-VERIF-' + Date.now(),
      credential_url: 'https://skilltrack.org/verify/cert'
    });
    assert(issueCertRes.status === 201 && issueCertRes.body?.certificate?.id, 'Institute can issue verified certificate and notify student');
  }

  // 4. EMPLOYER / INDUSTRY ENDPOINTS
  console.log('\n[4] Testing Employer / Industry Endpoints:');
  const employerHeaders = {
    'Authorization': `Bearer ${tokens.industry}`,
    'Content-Type': 'application/json'
  };

  const empJobs = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/industry/jobs',
    method: 'GET',
    headers: employerHeaders
  });
  assert(empJobs.status === 200 && Array.isArray(empJobs.body?.jobs), 'Employer can fetch posted jobs');

  // Employer certificate issuance
  if (instStudents.body?.students?.length > 0) {
    const firstStudentId = instStudents.body.students[0].id || instStudents.body.students[0].student_id;
    const empCertRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/industry/certificates',
      method: 'POST',
      headers: employerHeaders
    }, {
      student_id: firstStudentId,
      title: 'Industry Apprenticeship Completion',
      credential_id: 'CORP-APP-' + Date.now(),
      credential_url: 'https://acme-corp.com/verify'
    });
    assert(empCertRes.status === 201 && empCertRes.body?.certificate?.id, 'Employer can issue verifiable certificate to candidate');
  }

  // Feature 9: Employer Level 3 Outcome Verification
  const pendingVerifRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/industry/pending-verifications',
    method: 'GET',
    headers: employerHeaders
  });
  assert(pendingVerifRes.status === 200 && Array.isArray(pendingVerifRes.body?.records), 'Employer can list pending employment outcomes for Level 3 audit');
  if (pendingVerifRes.body?.records?.length > 0) {
    const firstRec = pendingVerifRes.body.records[0];
    assert(firstRec.trainee_id !== undefined, 'Pending verification outcome includes linked Trainee ID');

    const verifyOutcomeRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/industry/verifications/${firstRec.id}`,
      method: 'PUT',
      headers: employerHeaders
    }, {
      monthly_salary: 42000,
      notes: 'Level 3 automated employer verification audit confirmed'
    });
    assert(verifyOutcomeRes.status === 200 && verifyOutcomeRes.body?.verification_level === 'employer_verified', 'Employer can verify milestone outcome at Level 3 (Employer Verified)');
  }

  // 5. GOVERNMENT 9-AXIS AI INSIGHTS & CSV EXPORT
  console.log('\n[5] Testing Government 9-Axis AI Decision Support & Export:');
  const govHeaders = {
    'Authorization': `Bearer ${tokens.government}`,
    'Content-Type': 'application/json'
  };

  const govOverview = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/government/stats/overview',
    method: 'GET',
    headers: govHeaders
  });
  assert(govOverview.status === 200 && govOverview.body?.totalStudents !== undefined, 'Government overview stats returns 200 OK');

  const govAiInsights = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/government/ai/insights',
    method: 'GET',
    headers: govHeaders
  });
  assert(govAiInsights.status === 200, 'Government 9-axis AI insights returns 200 OK');
  assert(govAiInsights.body?.disclaimer && govAiInsights.body.disclaimer.includes('decision-support system'), 'Government AI includes advisory disclaimer');
  assert(Array.isArray(govAiInsights.body?.insights) && govAiInsights.body.insights.length >= 5, `Government AI synthesized ${govAiInsights.body?.insights?.length} multi-axis policy insights`);

  // Government skill gaps
  const govSkillGaps = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/government/stats/skill-gaps?district=Pune',
    method: 'GET',
    headers: govHeaders
  });
  assert(govSkillGaps.status === 200 && Array.isArray(govSkillGaps.body?.skillAnalysis), 'Regional skill gap analytics calculates demand vs. supply index');

  // Government CSV Export
  const govCsv = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/government/reports/export',
    method: 'GET',
    headers: govHeaders
  });
  assert(govCsv.status === 200, 'Government CSV export returns 200 OK');
  assert(govCsv.headers['content-type']?.includes('text/csv'), 'Government CSV export has text/csv content-type');
  assert(govCsv.raw.includes('Record_ID,Student_Name,Email'), 'Government CSV export contains expected table headers');

  console.log(`\n=== SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
