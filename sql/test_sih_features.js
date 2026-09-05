/**
 * SIH26135 End-to-End Test Suite
 * ------------------------------
 * Verifies all longitudinal tracking, multi-level verification,
 * AI skill gap & normalization, and government decision-support analytics.
 */

const assert = require('assert');
const { normalizeSkillName } = require('../server/utils/aiEngine');

const BASE_URL = 'http://localhost:3000/api';

async function req(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function login(identifier, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await res.json();
  return { status: res.status, token: data.token, user: data.user, data };
}

async function runSIHTests() {
  console.log('==================================================');
  console.log('STARTING SIH26135 LONGITUDINAL & OUTCOME TEST SUITE');
  console.log('==================================================\n');

  // TEST 1: Deterministic Skill Normalization
  console.log('--- TEST 1: Deterministic Skill Normalization ---');
  assert.strictEqual(normalizeSkillName('ReactJS'), 'React', 'ReactJS normalized');
  assert.strictEqual(normalizeSkillName('react.js'), 'React', 'react.js normalized');
  assert.strictEqual(normalizeSkillName('NodeJS'), 'Node.js', 'NodeJS normalized');
  assert.strictEqual(normalizeSkillName('Python3'), 'Python', 'Python3 normalized');
  assert.strictEqual(normalizeSkillName('docker compose'), 'Docker', 'docker compose normalized');
  assert.strictEqual(normalizeSkillName('AWS'), 'AWS', 'AWS normalized');
  assert.strictEqual(normalizeSkillName('powerbi'), 'Power BI', 'powerbi normalized');
  console.log('1. All skill normalization rules verified: PASS\n');

  // TEST 2: Student Login & Employability Readiness Score (Rahul)
  console.log('--- TEST 2: Employability Readiness Score ---');
  const studentLogin = await login('rahul@demo.com', 'Password123!');
  assert.strictEqual(studentLogin.status, 200, 'Student logged in');
  const studentToken = studentLogin.token;

  const readinessRes = await req('/student/readiness', { token: studentToken });
  assert.strictEqual(readinessRes.status, 200, 'Readiness score fetched');
  assert(readinessRes.data.readinessScore > 0, 'Score is greater than 0');
  assert(readinessRes.data.tier, 'Readiness tier provided');
  assert(readinessRes.data.breakdown.length === 5, '5 evaluation dimensions present');
  console.log(`2a. Rahul Employability Readiness Score: ${readinessRes.data.readinessScore}/100 (${readinessRes.data.tier})`);
  console.log('2b. Readiness 5-dimension breakdown verified: PASS\n');

  // TEST 3: AI Skill Gap with 5-Step Learning Roadmap
  console.log('--- TEST 3: AI Skill Gap & 5-Step Learning Roadmap ---');
  const jobsRes = await req('/student/jobs', { token: studentToken });
  assert(jobsRes.data.jobs.length > 0, 'Jobs available');
  const targetJobId = jobsRes.data.jobs[0].id;

  const roadmapRes = await req(`/student/ai/roadmap/${targetJobId}`, { token: studentToken });
  assert.strictEqual(roadmapRes.status, 200, 'Roadmap endpoint returned 200');
  assert(roadmapRes.data.roadmap && roadmapRes.data.roadmap.length > 0, 'Actionable roadmap generated');
  console.log(`3a. Generated ${roadmapRes.data.roadmap.length}-step prioritized learning roadmap for Job: "${roadmapRes.data.job.title}"`);
  console.log(`3b. Step 1 Action: ${roadmapRes.data.roadmap[0].action}`);
  console.log('3c. Learning Roadmap: PASS\n');

  // TEST 4: Student Submitting Longitudinal Follow-up
  console.log('--- TEST 4: Student Longitudinal Follow-up Reporting ---');
  const followUpRes = await req('/student/follow-up', {
    method: 'POST',
    token: studentToken,
    body: {
      milestone_days: 365,
      outcome_type: 'employed',
      job_title: 'Senior Analytics Specialist',
      monthly_salary: 38000,
      employer_name: 'Apex Data Labs',
      location_district: 'Pune',
      follow_up_notes: 'Promoted again after 1 year. Wage progression verified.'
    }
  });
  assert.strictEqual(followUpRes.status, 201, 'Follow-up submitted successfully');
  const recordId = followUpRes.data.recordId;
  console.log(`4a. Follow-up submitted (Record ID: ${recordId}): PASS`);

  // Check career journey
  const journeyRes = await req('/student/career-journey', { token: studentToken });
  assert.strictEqual(journeyRes.status, 200, 'Career journey returned 200');
  assert(journeyRes.data.journey.length >= 4, 'Multiple longitudinal milestones recorded');
  console.log(`4b. Rahul career journey contains ${journeyRes.data.journey.length} verified milestone entries: PASS\n`);

  // TEST 5: Multi-Level Outcome Verification (Industry User)
  console.log('--- TEST 5: Multi-Source Outcome Verification ---');
  const indLogin = await login('industry@demo.com', 'Password123!');
  assert.strictEqual(indLogin.status, 200, 'Industry user logged in');
  const indToken = indLogin.token;

  const verifyRes = await req(`/industry/verifications/${recordId}`, {
    method: 'PUT',
    token: indToken,
    body: {
      monthly_salary: 38000,
      notes: 'Employer verified payroll records and active employee status.'
    }
  });
  assert.strictEqual(verifyRes.status, 200, 'Verification update succeeded');
  assert.strictEqual(verifyRes.data.verification_level, 'employer_verified', 'Upgraded to Level 3 Employer Verified');
  console.log('5. Placement elevated to Level 3 (Employer Verified): PASS\n');

  // TEST 6: Government Longitudinal Retention & Salary Progression Analytics
  console.log('--- TEST 6: Government Retention & Outcome Analytics ---');
  const govLogin = await login('gov@demo.com', 'Password123!');
  assert.strictEqual(govLogin.status, 200, 'Government logged in');
  const govToken = govLogin.token;

  const retentionRes = await req('/government/stats/retention', { token: govToken });
  assert.strictEqual(retentionRes.status, 200, 'Retention stats returned 200');
  assert(retentionRes.data.milestones.length === 4, '30, 90, 180, 365 days present');
  console.log(`6a. State 1-Year Retention Rate: ${retentionRes.data.overallRetentionRate}%`);
  for (const m of retentionRes.data.milestones) {
    console.log(`    Milestone ${m.milestoneLabel}: ${m.employedCount} employed (${m.retentionRate}% retention), Avg Salary: ₹${m.avgMonthlySalary.toLocaleString('en-IN')}/mo`);
  }
  console.log('6b. Multi-Level Verification breakdown:');
  console.log(`    Level 1 (Self-Reported): ${retentionRes.data.verificationLevels.level1_self_reported}`);
  console.log(`    Level 2 (Institute Verified): ${retentionRes.data.verificationLevels.level2_institute_verified}`);
  console.log(`    Level 3 (Employer Verified): ${retentionRes.data.verificationLevels.level3_employer_verified}`);
  console.log('6c. Retention Analytics: PASS\n');

  // TEST 7: AI Regional Industry Skill Gap Engine (Demand vs Supply)
  console.log('--- TEST 7: AI Regional Industry Skill Gap Engine ---');
  const gapRes = await req('/government/stats/skill-gaps', { token: govToken });
  assert.strictEqual(gapRes.status, 200, 'Skill gaps returned 200');
  assert(gapRes.data.skillGaps.length > 0, 'Skill gaps calculated');
  assert(gapRes.data.recommendations.length > 0, 'Automated policy recommendations generated');
  console.log(`7a. Analyzed ${gapRes.data.totalJobsAnalyzed} industry jobs against ${gapRes.data.totalStudentsAnalyzed} student profiles`);
  console.log('7b. Top Skill Deficits & Surpluses:');
  gapRes.data.skillGaps.slice(0, 4).forEach(g => {
    console.log(`    • ${g.skill}: Demand ${g.demandPercent}% vs Supply ${g.supplyPercent}% (Gap: ${g.gapIndex > 0 ? '+' : ''}${g.gapIndex}%) -> [${g.status}]`);
  });
  console.log(`7c. Automated Policy Recommendation: "${gapRes.data.recommendations[0].title}"`);
  console.log(`    Action: ${gapRes.data.recommendations[0].action}`);
  console.log('7d. Regional AI Skill Gap Engine: PASS\n');

  // TEST 8: Unemployment Root Causes Analysis
  console.log('--- TEST 8: Unemployment Root Causes Analysis ---');
  const unempRes = await req('/government/stats/unemployment-reasons', { token: govToken });
  assert.strictEqual(unempRes.status, 200, 'Unemployment reasons returned 200');
  assert(unempRes.data.reasons.length > 0, 'Reasons categorized');
  console.log(`8a. Total unplaced trainees categorized: ${unempRes.data.totalUnemployedTracked}`);
  unempRes.data.reasons.forEach(r => {
    console.log(`    • ${r.reasonLabel}: ${r.count} students (${r.percent}%)`);
  });
  console.log('8b. Root Causes Analytics: PASS\n');

  // TEST 9: Institute Performance & Course Outcome-Based Evaluation
  console.log('--- TEST 9: Institute & Program Outcome-Based Evaluation ---');
  const instRes = await req('/government/stats/institutes', { token: govToken });
  assert.strictEqual(instRes.status, 200, 'Institutes returned 200');
  console.log(`9a. Tracked ${instRes.data.institutes.length} accredited institutes:`);
  instRes.data.institutes.slice(0, 3).forEach(i => {
    console.log(`    • ${i.name} (${i.district}): Placement Rate ${i.placement_rate}%, Avg Package: ₹${i.avg_package.toLocaleString('en-IN')}`);
  });

  const progRes = await req('/government/stats/program-evaluation', { token: govToken });
  assert.strictEqual(progRes.status, 200, 'Program evaluation returned 200');
  console.log(`9b. Evaluated ${progRes.data.programs.length} state training programs:`);
  progRes.data.programs.forEach(p => {
    console.log(`    • ${p.title}: Enrolled ${p.enrolled}, Placed ${p.employed} (${p.placementRate}%), 1-Yr Retention: ${p.retention1Year}%`);
  });
  console.log('9c. Outcome-Based Evaluation: PASS\n');

  // TEST 10: Trainee Longitudinal Journey Spotlight (Rahul Sharma)
  console.log('--- TEST 10: Trainee Longitudinal Spotlight (Rahul Case Study) ---');
  const rahulRes = await req('/government/stats/trainee-journey/rahul', { token: govToken });
  assert.strictEqual(rahulRes.status, 200, 'Rahul journey returned 200');
  assert.strictEqual(rahulRes.data.trainee.name, 'Rahul Sharma', 'Rahul Sharma matched');
  console.log(`10a. Trainee: ${rahulRes.data.trainee.name} | College: ${rahulRes.data.trainee.college} | District: ${rahulRes.data.trainee.district}`);
  console.log('10b. Longitudinal Career Trajectory:');
  rahulRes.data.journey.forEach(j => {
    const sal = j.monthly_salary ? `₹${j.monthly_salary.toLocaleString('en-IN')}/mo` : 'Unpaid/Looking';
    const comp = j.employer_name || j.unemployment_reason || 'N/A';
    console.log(`     Day ${j.milestone_days} [${j.verification_level}]: ${j.job_title} @ ${comp} (${sal})`);
  });
  console.log('10c. Rahul Case Study Spotlight: PASS\n');

  console.log('==================================================');
  console.log('🎉 ALL 10 SIH26135 TESTS PASSED 100% SUCCESSFULLY!');
  console.log('==================================================\n');
}

runSIHTests().catch(err => {
  console.error('SIH Test Suite Failed:', err);
  process.exit(1);
});
