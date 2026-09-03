// industry.js - Industry Portal: Course Creation, Student Project Evaluations, Candidate Pipeline & Verification
function navToIndustryView(subView) {
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-industry');
  if (screen) screen.style.display = 'grid';

  document.querySelectorAll('#screen-industry .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-industry-${subView}`);
  if (activeLi) activeLi.classList.add('active');

  const rDashboard = document.getElementById('rnav-dashboard');
  const rSettings = document.getElementById('rnav-settings');
  if (subView === 'profile') {
    if (rDashboard) rDashboard.classList.remove('active');
    if (rSettings) rSettings.classList.add('active');
  } else {
    if (rDashboard) rDashboard.classList.add('active');
    if (rSettings) rSettings.classList.remove('active');
  }

  const container = document.getElementById('industryContentArea');
  if (!container) return;

  const ind = getActiveCompany();

  switch (subView) {
    case 'dashboard': renderIndustryDashboard(container, ind); break;
    case 'courses': renderCompanyCoursesManager(container, ind); break;
    case 'careers': renderCompanyCareerPathsManager(container, ind); break;
    case 'evaluations': renderStudentSubmissionsEvaluator(container, ind); break;
    case 'candidates':
    case 'hiring': renderIndustryCandidatesPipeline(container, ind); break;
    case 'jobs': renderIndustryJobs(container, ind); break;
    case 'verification': renderEmployerVerificationLedger(container, ind); break;
    case 'profile': renderIndustryProfileSettings(container, ind); break;
    default: renderIndustryDashboard(container, ind);
  }

  window.location.hash = `industry/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToIndustryView = navToIndustryView;

function getActiveCompany() {
  const compId = window.SKT_STATE.currentCompanyId || 1;
  const companies = window.SKT_STATE.companies || [];
  const found = companies.find(c => c.id === compId);
  if (found) {
    window.SKT_STATE.industry.id = found.id;
    window.SKT_STATE.industry.companyName = found.name || found.companyName;
    window.SKT_STATE.industry.industryType = found.sector || found.industryType;
    window.SKT_STATE.industry.district = found.district;
    window.SKT_STATE.industry.employerVerificationScore = found.employerVerificationScore || 98;
    window.SKT_STATE.industry.trustGrade = found.trustGrade || "A+ State Trusted Employer";
    window.SKT_STATE.industry.logoUrl = found.logo || found.logoUrl;
    if (found.jobs) window.SKT_STATE.industry.jobs = found.jobs;
  }
  return window.SKT_STATE.industry;
}

// ================= 1. INDUSTRY DASHBOARD ================= //
function renderIndustryDashboard(container, ind) {
  const stats = ind.stats || { activeJobs: 3, candidatesCount: 18, totalHired: 54 };
  const apps = (window.SKT_STATE.applications || []).filter(a => a.companyId === ind.id);
  const subs = (window.SKT_STATE.courseSubmissions || []).filter(s => s.companyId === ind.id);
  const trustScore = ind.employerVerificationScore || 98;

  container.innerHTML = `
    <!-- Trust Score Banner -->
    <div class="card" style="background:linear-gradient(135deg, #0b1528 0%, #065f46 100%); color:#fff; border:none; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="badge-pill badge-employed" style="background:rgba(16,185,129,0.2); color:#34d399; font-size:0.75rem;"><i class="fa-solid fa-shield-check"></i> STATE EMPLOYER VERIFICATION STATUS</span>
          <h2 style="font-size:1.6rem; font-weight:800; color:#fff; margin:0.35rem 0 0.2rem;">${ind.companyName}</h2>
          <p style="color:#a7f3d0; font-size:0.85rem;">
            Official Trust Score: <strong style="font-size:1.1rem; color:#fff;">${trustScore}%</strong> &bull; Status: <strong>${ind.trustGrade || 'A+ State Trusted Employer'}</strong>
          </p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary" onclick="navToIndustryView('evaluations')" style="background:#10b981; border-color:#10b981; color:#fff;"><i class="fa-solid fa-file-circle-check"></i> Project Submissions (${subs.length})</button>
          <button class="btn btn-outline" onclick="navToIndustryView('courses')" style="border-color:rgba(255,255,255,0.4); color:#fff;"><i class="fa-solid fa-graduation-cap"></i> Company Academy</button>
        </div>
      </div>
    </div>

    <div class="welcome-row">
      <div>
        <h2>Corporate Recruitment, Training & Talent Management</h2>
        <p><i class="fa-solid fa-building"></i> ${ind.industryType} &bull; <i class="fa-solid fa-location-dot"></i> ${ind.district}</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-outline" onclick="promptCreateCourseModal()"><i class="fa-solid fa-book-plus"></i> Publish New Course</button>
        <button class="btn btn-primary" onclick="promptPostOpening()"><i class="fa-solid fa-plus"></i> Post Job Opening</button>
      </div>
    </div>

    <!-- Macro Stats -->
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Published Vacancies</span><strong class="stat-val">${(ind.jobs || []).length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Candidate Applications</span><strong class="stat-val highlight-blue">${apps.length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Project Submissions</span><strong class="stat-val highlight-purple">${subs.length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Total Placed / Hired</span><strong class="stat-val highlight-green">${stats.totalHired}</strong></div>
    </div>

    <!-- Candidate Applications Quick Table -->
    <div class="card">
      <div class="card-head space-between">
        <h3>Live Candidate Applications (Connected with Student Dashboard)</h3>
        <button class="btn btn-sm btn-outline" onclick="navToIndustryView('candidates')">Open Full Pipeline &rarr;</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Candidate Name</th><th>Target Opening</th><th>AI Match</th><th>Date</th><th>Current Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${apps.map(app => `
              <tr>
                <td><strong>${app.studentName}</strong><br><span class="text-muted" style="font-size:0.75rem;"><code>${app.studentPassportId}</code></span></td>
                <td>${app.jobTitle}</td>
                <td><strong class="highlight-blue"><i class="fa-solid fa-brain"></i> ${app.matchScore}%</strong></td>
                <td>${app.appliedDate}</td>
                <td><span class="badge-pill ${app.status === 'Selected' ? 'badge-employed' : (app.status === 'Interview Scheduled' ? 'info' : 'warning')}">${app.status}</span></td>
                <td>
                  <div style="display:flex; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline" onclick="viewCandidateDossier('${app.studentName}')" title="Inspect Full Skills & Certificates"><i class="fa-solid fa-eye"></i> Profile</button>
                    ${app.status !== 'Selected' ? `
                      <button class="btn btn-sm btn-primary" onclick="promptScheduleInterviewModal(${app.id})" title="Schedule Interview & Google Meet"><i class="fa-solid fa-calendar"></i> Interview</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ================= 2. COMPANY ACADEMY & COURSES (CREATE & MANAGE) ================= //
function renderCompanyCoursesManager(container, ind) {
  const courses = (window.SKT_STATE.courses || []).filter(c => (c.companies && c.companies.includes(ind.companyName)) || c.provider.includes(ind.companyName));

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Corporate Academy & Course Offerings</h2>
        <p>Define industry-required skills, upload learning modules, set hands-on assignments, and build MCQ certification quizzes.</p>
      </div>
      <button class="btn btn-primary" onclick="promptCreateCourseModal()"><i class="fa-solid fa-plus"></i> Create & Publish Course</button>
    </div>

    <div class="features-grid" style="grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));">
      ${courses.map(c => `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="badge-pill info">CODE: ${c.code}</span>
              <span class="badge-pill badge-employed">${c.duration}</span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:0.35rem;">${c.title}</h3>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">${c.overview}</p>
            
            <div style="margin-bottom:0.75rem;">
              <strong style="font-size:0.75rem; text-transform:uppercase; color:#64748b; display:block; margin-bottom:0.35rem;">Skills Imparted:</strong>
              ${(c.skillsTaught || []).map(s => `<span class="badge-pill info" style="margin-right:0.25rem; font-size:0.75rem;">${s}</span>`).join('')}
            </div>

            <div style="background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; font-size:0.8rem; margin-bottom:1rem;">
              <div><strong>Lessons:</strong> ${(c.lessons || []).length} Mentor Modules</div>
              <div><strong>Assignment:</strong> ${c.assignment ? c.assignment.title : 'None'}</div>
              <div><strong>Certification Quiz:</strong> ${c.quiz && c.quiz.questions ? `${c.quiz.questions.length} MCQ Questions` : 'Configured'}</div>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem; border-top:1px solid #e2e8f0; padding-top:0.75rem;">
            <button class="btn btn-sm btn-outline" style="flex:1;" onclick="navToIndustryView('evaluations')"><i class="fa-solid fa-file-signature"></i> View Submissions</button>
            <button class="btn btn-sm btn-primary" onclick="showToast('Course is live in student search & enrollment catalog.', 'info')"><i class="fa-solid fa-check"></i> Published</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Modal to Create Course, Skills, Lessons, Assignment & MCQ Quiz
function promptCreateCourseModal() {
  const ind = window.SKT_STATE.industry;
  const html = `
    <form onsubmit="submitNewCompanyCourse(event)">
      <div class="form-row">
        <div class="form-group"><label>Course Title</label><input type="text" id="ccTitle" placeholder="e.g. Advanced Cloud Microservices & Docker" required /></div>
        <div class="form-group"><label>Course Code</label><input type="text" id="ccCode" placeholder="e.g. CMS-301" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Domain / Category</label><input type="text" id="ccCategory" placeholder="e.g. Cloud & DevOps" required /></div>
        <div class="form-group"><label>Course Duration</label><input type="text" id="ccDuration" value="6 Weeks" required /></div>
      </div>
      <div class="form-group"><label>Prerequisite Skills (comma-separated)</label><input type="text" id="ccReqSkills" value="Linux, Git, Basic Networking" required /></div>
      <div class="form-group"><label>Skills Imparted / Taught (comma-separated)</label><input type="text" id="ccSkillsTaught" value="Docker, Kubernetes, AWS Cloud, CI/CD" required /></div>
      <div class="form-group"><label>Course Overview & Objectives</label><textarea id="ccOverview" rows="2" required>Hands-on industry curriculum covering microservices architecture, container orchestration, and production deployments.</textarea></div>
      
      <!-- Lesson & Assignment Specs -->
      <h4 style="color:var(--primary); margin:1rem 0 0.5rem;"><i class="fa-solid fa-book-open"></i> Practical Project Assignment</h4>
      <div class="form-group"><label>Assignment Title</label><input type="text" id="ccAsgTitle" value="Containerize & Deploy High-Availability Web Microservice" required /></div>
      <div class="form-group"><label>Assignment Task Prompt</label><textarea id="ccAsgPrompt" rows="2" required>Construct a multi-stage Dockerfile for a Node.js REST backend, configure Docker Compose with MySQL replication, and submit GitHub repository and architectural PDF.</textarea></div>

      <!-- MCQ Quiz Section -->
      <h4 style="color:var(--primary); margin:1rem 0 0.5rem;"><i class="fa-solid fa-list-check"></i> Assessment Quiz (MCQ Question 1)</h4>
      <div class="form-group"><label>Question 1 Text</label><input type="text" id="ccQ1" value="What command is used to run a Docker container in detached background mode?" required /></div>
      <div class="form-row">
        <div class="form-group"><label>Option 1</label><input type="text" id="ccQ1O1" value="docker run -d" required /></div>
        <div class="form-group"><label>Option 2</label><input type="text" id="ccQ1O2" value="docker start -b" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Option 3</label><input type="text" id="ccQ1O3" value="docker exec -bg" required /></div>
        <div class="form-group"><label>Option 4</label><input type="text" id="ccQ1O4" value="docker run --quiet" required /></div>
      </div>
      <div class="form-group">
        <label>Correct Answer Index</label>
        <select id="ccQ1Correct">
          <option value="0">Option 1 (docker run -d)</option>
          <option value="1">Option 2</option>
          <option value="2">Option 3</option>
          <option value="3">Option 4</option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Publish Course to Platform</button>
    </form>
  `;
  openSharedModal("Create & Publish Company Course", html);
}

function submitNewCompanyCourse(e) {
  e.preventDefault();
  const courseData = {
    title: document.getElementById('ccTitle').value.trim(),
    code: document.getElementById('ccCode').value.trim(),
    category: document.getElementById('ccCategory').value.trim(),
    duration: document.getElementById('ccDuration').value.trim(),
    requiredSkills: document.getElementById('ccReqSkills').value.split(',').map(s => s.trim()),
    skillsTaught: document.getElementById('ccSkillsTaught').value.split(',').map(s => s.trim()),
    overview: document.getElementById('ccOverview').value.trim(),
    assignment: {
      id: `asg-${Date.now()}`,
      title: document.getElementById('ccAsgTitle').value.trim(),
      prompt: document.getElementById('ccAsgPrompt').value.trim(),
      submitted: false,
      submissionText: "",
      grade: null
    },
    quiz: {
      id: `quiz-${Date.now()}`,
      title: `${document.getElementById('ccTitle').value.trim()} Certification Quiz`,
      passed: false,
      score: null,
      questions: [
        {
          q: document.getElementById('ccQ1').value.trim(),
          options: [
            document.getElementById('ccQ1O1').value.trim(),
            document.getElementById('ccQ1O2').value.trim(),
            document.getElementById('ccQ1O3').value.trim(),
            document.getElementById('ccQ1O4').value.trim()
          ],
          correct: Number(document.getElementById('ccQ1Correct').value)
        }
      ]
    }
  };

  window.createCompanyCourse(courseData);
  closeSharedModal();
  navToIndustryView('courses');
}

// ================= 2B. COMPANY CAREER PATHS ================= //
function renderCompanyCareerPathsManager(container, ind) {
  const paths = (window.SKT_STATE.careerPaths || []).filter(p => p.companyId === ind.id);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Company Career Paths & Trajectories</h2>
        <p>Define clear career ladders, required skills, target compensation, and recommended courses for aspiring candidates in ${ind.companyName}.</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-outline btn-sm" onclick="navToIndustryView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
        <button class="btn btn-primary" onclick="promptCreateCareerPathModal()"><i class="fa-solid fa-plus"></i> Create Career Path</button>
      </div>
    </div>

    <div class="grid-2col-even">
      ${paths.map(p => `
        <div class="card" style="border-top:4px solid var(--primary); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
              <span class="badge-pill info">Target Career Trajectory</span>
              <strong class="highlight-green">${p.startingSalary}</strong>
            </div>
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.35rem;">${p.title}</h3>
            <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">${p.description}</p>
            
            <div style="margin-bottom:0.75rem;">
              <strong style="font-size:0.75rem; text-transform:uppercase; color:#64748b; display:block; margin-bottom:0.35rem;">Required Prerequisite Skills:</strong>
              ${(p.requiredSkills || []).map(s => `<span class="badge-pill info" style="margin-right:0.25rem; font-size:0.75rem;">${s}</span>`).join('')}
            </div>

            <div style="margin-bottom:0.75rem;">
              <strong style="font-size:0.75rem; text-transform:uppercase; color:#64748b; display:block; margin-bottom:0.35rem;">Core Competencies Imparted:</strong>
              ${(p.skillsImparted || []).map(s => `<span class="badge-pill badge-employed" style="margin-right:0.25rem; font-size:0.75rem;">${s}</span>`).join('')}
            </div>
          </div>

          <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <span class="text-muted" style="font-size:0.8rem;"><i class="fa-solid fa-briefcase"></i> ${p.openJobsCount || 1} Open Vacancy Linked</span>
            <button class="btn btn-sm btn-outline" onclick="navToIndustryView('courses')">View Linked Courses &rarr;</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptCreateCareerPathModal() {
  const ind = window.SKT_STATE.industry;
  const html = `
    <form onsubmit="submitNewCompanyCareerPath(event)">
      <div class="form-group">
        <label>Career Path Title</label>
        <input type="text" id="cpTitle" placeholder="e.g. Associate Cloud Infrastructure & DevOps Engineer" required />
      </div>
      <div class="form-row">
        <div class="form-group"><label>Starting Salary Range</label><input type="text" id="cpSalary" value="₹26,000 - ₹35,000 / month" required /></div>
        <div class="form-group"><label>Open Vacancies Count</label><input type="number" id="cpOpenings" value="2" required /></div>
      </div>
      <div class="form-group">
        <label>Role Description & Career Mission</label>
        <textarea id="cpDesc" rows="2" required>Architecting multi-tier cloud deployments, automated CI/CD pipeline development, and microservice monitoring.</textarea>
      </div>
      <div class="form-group">
        <label>Prerequisite Skills (comma-separated)</label>
        <input type="text" id="cpReqSkills" value="AWS Cloud, Docker, Linux, Node.js" required />
      </div>
      <div class="form-group">
        <label>Skills Imparted During Training (comma-separated)</label>
        <input type="text" id="cpSkillsImparted" value="Microservices Architecture, Docker Compose, Terraform Basics, Prometheus" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-route"></i> Publish Company Career Path</button>
    </form>
  `;
  openSharedModal("Create Company Career Path", html);
}

function submitNewCompanyCareerPath(e) {
  e.preventDefault();
  const ind = window.SKT_STATE.industry;
  const careerData = {
    companyId: ind.id,
    companyName: ind.companyName,
    title: document.getElementById('cpTitle').value.trim(),
    startingSalary: document.getElementById('cpSalary').value.trim(),
    openJobsCount: parseInt(document.getElementById('cpOpenings').value) || 1,
    description: document.getElementById('cpDesc').value.trim(),
    requiredSkills: document.getElementById('cpReqSkills').value.split(',').map(s => s.trim()),
    skillsImparted: document.getElementById('cpSkillsImparted').value.split(',').map(s => s.trim())
  };

  window.createCompanyCareerPath(careerData);
  closeSharedModal();
  navToIndustryView('careers');
}

function previewSubmissionPdf(fileName) {
  const html = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #cbd5e1; padding-bottom:1rem; margin-bottom:1rem;">
        <div>
          <h3 style="margin:0; font-size:1.2rem; color:#1e293b;"><i class="fa-solid fa-file-pdf text-red"></i> ${fileName}</h3>
          <p class="text-muted" style="font-size:0.85rem; margin:0.25rem 0 0;">Official Student Project Deliverable Report & Architecture Dossier</p>
        </div>
        <span class="badge-pill badge-employed"><i class="fa-solid fa-circle-check"></i> Verified Cryptographic Hash</span>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; padding:1.25rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
        <h4 style="font-size:0.95rem; color:#1e3a8a; margin-bottom:0.5rem;"><i class="fa-solid fa-diagram-project"></i> Project Architecture & Execution Specifications</h4>
        <p style="font-size:0.85rem; color:#475569; line-height:1.5;">
          The student has submitted an end-to-end implementation resolving production requirements. Includes parameterized SQL CTE queries, database indexing specifications, and sub-50ms query plan analysis.
        </p>
        <div style="background:#0f172a; color:#38bdf8; font-family:monospace; padding:1rem; border-radius:var(--radius-sm); font-size:0.8rem; overflow-x:auto; margin-top:0.75rem;">
-- Verified Query Deliverable Excerpt
WITH DistrictDeficits AS (
  SELECT district_id, district_name, SUM(deficit_units) as total_deficit
  FROM logistics_supply_ledger
  WHERE inventory_status = 'CRITICAL'
  GROUP BY district_id, district_name
)
SELECT d.district_name, d.total_deficit, RANK() OVER (ORDER BY d.total_deficit DESC) as severity_rank
FROM DistrictDeficits d
WHERE d.total_deficit > 1000;
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:0.85rem; color:#64748b;">File Size: <strong>1.84 MB</strong> &bull; Format: <strong>PDF Document</strong></div>
        <button class="btn btn-primary btn-sm" onclick="showToast('Downloaded ${fileName} to local workspace.', 'success');"><i class="fa-solid fa-download"></i> Download PDF Report</button>
      </div>
    </div>
  `;
  openSharedModal(`Deliverable Report: ${fileName}`, html);
}

// ================= 3. STUDENT SUBMISSIONS & PROJECT EVALUATIONS ================= //
function renderStudentSubmissionsEvaluator(container, ind) {
  const subs = (window.SKT_STATE.courseSubmissions || []).filter(s => s.companyId === ind.id);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Student Course Submissions & Project Evaluations</h2>
        <p>Review student practical deliverables, code repositories, assign grades, and endorse competencies to their Digital Skill Passport.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToIndustryView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Student Candidate</th><th>Course & Assignment</th><th>Deliverable & Code</th><th>Quiz Score</th><th>Status / Grade</th><th>Actions</th></tr></thead>
          <tbody>
            ${subs.map(sub => `
              <tr>
                <td>
                  <strong>${sub.studentName}</strong>
                  <div style="font-size:0.75rem; color:#64748b;"><code>${sub.studentPassportId}</code></div>
                </td>
                <td>
                  <strong>${sub.courseTitle}</strong>
                  <div style="font-size:0.8rem; color:#475569;">${sub.assignmentTitle}</div>
                </td>
                <td>
                  <div style="font-size:0.8rem; margin-bottom:0.25rem;">
                    <a href="${sub.githubUrl}" target="_blank" class="badge-pill info" style="text-decoration:none;"><i class="fa-brands fa-github"></i> Repository</a>
                    <span class="badge-pill badge-employed" onclick="previewSubmissionPdf('${sub.projectFileName}')" style="cursor:pointer;" title="Click to View & Download PDF Deliverable"><i class="fa-solid fa-file-pdf"></i> ${sub.projectFileName}</span>
                  </div>
                  <div style="font-size:0.75rem; color:#64748b; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><code>${sub.submissionText}</code></div>
                </td>
                <td><strong class="highlight-green"><i class="fa-solid fa-badge-check"></i> ${sub.quizScore}</strong></td>
                <td>
                  ${sub.evaluationStatus === 'Graded' ? `
                    <span class="badge-pill badge-employed">${sub.grade} (${sub.marks}/100)</span>
                    <div style="font-size:0.7rem; color:#16a34a; font-weight:700;">Endorsed: ${sub.skillEndorsed || 'Verified'}</div>
                  ` : `
                    <span class="badge-pill warning">Pending Evaluation</span>
                  `}
                </td>
                <td>
                  <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
                    <button class="btn btn-sm btn-primary" onclick="promptEvaluateSubmissionModal(${sub.id})" title="Grade Project & Endorse Skill">
                      <i class="fa-solid fa-pen-ruler"></i> Evaluate & Grade
                    </button>
                    <button class="btn btn-sm btn-success" onclick="fastTrackCandidateFromSubmission(${sub.id})" title="Invite directly to interview">
                      <i class="fa-solid fa-video"></i> Fast-Track Interview
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Modal to Evaluate Submission & Endorse Skill
function promptEvaluateSubmissionModal(subId) {
  const sub = (window.SKT_STATE.courseSubmissions || []).find(s => s.id === Number(subId));
  if (!sub) return;

  const html = `
    <form onsubmit="submitProjectEvaluation(event, ${subId})">
      <div class="form-row">
        <div class="form-group"><label>Candidate Name</label><input type="text" value="${sub.studentName} (${sub.studentPassportId})" disabled /></div>
        <div class="form-group"><label>Course Title</label><input type="text" value="${sub.courseTitle}" disabled /></div>
      </div>
      <div class="form-group">
        <label>Submitted Deliverable Code / Query</label>
        <textarea rows="3" disabled style="font-family:monospace; background:#f8fafc;">${sub.submissionText}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Numerical Marks (out of 100)</label><input type="number" id="evMarks" min="0" max="100" value="${sub.marks || 95}" required /></div>
        <div class="form-group">
          <label>Letter Grade</label>
          <select id="evGrade">
            <option value="Grade A+" ${sub.grade === 'Grade A+' ? 'selected' : ''}>Grade A+ (Exemplary Performance)</option>
            <option value="Grade A" ${sub.grade === 'Grade A' ? 'selected' : ''}>Grade A (Proficient)</option>
            <option value="Grade B+" ${sub.grade === 'Grade B+' ? 'selected' : ''}>Grade B+ (Good)</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Technical Evaluator Name</label><input type="text" id="evEvaluator" value="Vikram Malhotra (Lead Technical Reviewer)" required /></div>
      <div class="form-group"><label>Technical Feedback & Review</label><textarea id="evFeedback" rows="2" required>${sub.feedback || 'Outstanding architectural optimization and clean query formatting. Ready for corporate production environment.'}</textarea></div>
      <div class="form-group">
        <label>Endorse Technical Competency to Student Passport</label>
        <input type="text" id="evSkillEndorsed" value="${sub.skillEndorsed || 'Data Analytics & Advanced SQL'}" required />
        <span class="text-muted" style="font-size:0.75rem;">This skill will be officially marked as "Verified by Tech Solutions HR" on the student's public digital passport.</span>
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fa-solid fa-check"></i> Submit Evaluation & Endorse Skill</button>
    </form>
  `;
  openSharedModal(`Evaluate Project: ${sub.studentName}`, html);
}

function submitProjectEvaluation(e, subId) {
  e.preventDefault();
  const evaluationData = {
    marks: document.getElementById('evMarks').value,
    grade: document.getElementById('evGrade').value,
    evaluator: document.getElementById('evEvaluator').value.trim(),
    feedback: document.getElementById('evFeedback').value.trim(),
    skillEndorsed: document.getElementById('evSkillEndorsed').value.trim()
  };
  closeSharedModal();
  window.gradeStudentSubmission(subId, evaluationData);
}

function fastTrackCandidateFromSubmission(subId) {
  const sub = (window.SKT_STATE.courseSubmissions || []).find(s => s.id === Number(subId));
  if (!sub) return;

  const interviewData = {
    round: "Fast-Track Project Discussion & Architecture Round",
    interviewer: "Vikram Malhotra (Lead Architect)",
    date: "Tomorrow",
    time: "04:30 PM IST",
    mode: "Google Meet",
    meetingLink: "https://meet.google.com/fast-track-review",
    feedback: `Fast-tracked to interview based on Grade A+ evaluation in ${sub.courseTitle}.`
  };

  // Find or create application
  let app = (window.SKT_STATE.applications || []).find(a => a.studentId === sub.studentId && a.companyId === sub.companyId);
  if (app) {
    window.updateApplicationStatus(app.id, 'Interview Scheduled', interviewData);
  } else {
    app = {
      id: Date.now(),
      jobId: 1,
      jobTitle: "Associate Data & Cloud Engineer",
      companyId: sub.companyId,
      companyName: sub.companyName,
      companyLogo: window.SKT_STATE.industry.logoUrl,
      studentId: sub.studentId,
      studentName: sub.studentName,
      studentEmail: sub.studentEmail,
      studentPassportId: sub.studentPassportId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: "Interview Scheduled",
      matchScore: 96,
      interviewInfo: interviewData
    };
    window.SKT_STATE.applications.unshift(app);
    window.saveLocalSktState();
  }

  showToast(`Fast-track interview scheduled for ${sub.studentName}! Notification synced to student dashboard.`, "success");
  navToIndustryView('candidates');
}

// ================= 4. CANDIDATE PIPELINE & INTERVIEWS ================= //
function renderIndustryCandidatesPipeline(container, ind) {
  const apps = (window.SKT_STATE.applications || []).filter(a => a.companyId === ind.id);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Candidate Applications & Hiring Pipeline</h2>
        <p>Review verified candidate skills, certificates, projects, and schedule interviews with automatic student dashboard sync.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToIndustryView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Candidate</th><th>Job Position</th><th>AI Match</th><th>Applied Date</th><th>Pipeline Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${apps.map(app => `
              <tr>
                <td>
                  <strong>${app.studentName}</strong>
                  <div style="font-size:0.75rem; color:#64748b;">${app.studentEmail} &bull; <code>${app.studentPassportId}</code></div>
                </td>
                <td><strong>${app.jobTitle}</strong></td>
                <td><strong class="highlight-blue"><i class="fa-solid fa-brain"></i> ${app.matchScore}%</strong></td>
                <td>${app.appliedDate}</td>
                <td>
                  <span class="badge-pill ${app.status === 'Selected' ? 'badge-employed' : (app.status === 'Interview Scheduled' ? 'info' : 'warning')}">
                    ${app.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
                    <button class="btn btn-sm btn-outline" onclick="viewCandidateDossier('${app.studentName}')" title="View Full Verified Profile & Credentials">
                      <i class="fa-solid fa-id-card"></i> View Profile
                    </button>
                    ${app.status === 'Applied' ? `
                      <button class="btn btn-sm btn-outline" onclick="window.updateApplicationStatus(${app.id}, 'Shortlisted')">Shortlist</button>
                    ` : ''}
                    ${app.status !== 'Selected' ? `
                      <button class="btn btn-sm btn-primary" onclick="promptScheduleInterviewModal(${app.id})">
                        <i class="fa-solid fa-video"></i> Schedule Interview
                      </button>
                      <button class="btn btn-sm btn-success" onclick="confirmCandidateSelection(${app.id})">
                        <i class="fa-solid fa-check"></i> Select / Hire
                      </button>
                    ` : `
                      <span class="badge-pill badge-employed"><i class="fa-solid fa-award"></i> Hired & Ledger Recorded</span>
                    `}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Full Candidate Profile Dossier Modal
function viewCandidateDossier(studentName) {
  const s = window.SKT_STATE.student;
  const subs = (window.SKT_STATE.courseSubmissions || []).filter(sub => sub.studentId === s.id);

  const html = `
    <div style="padding:0.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0; padding-bottom:1rem; margin-bottom:1rem;">
        <div style="display:flex; gap:1rem; align-items:center;">
          <img src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:65px; height:65px; border-radius:50%; object-fit:cover; border:2px solid #2563eb;" />
          <div>
            <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:0.15rem;">${s.fullName}</h3>
            <p class="text-muted" style="font-size:0.85rem;"><i class="fa-solid fa-graduation-cap"></i> ${s.college} &bull; ${s.course}</p>
            <span class="badge-pill badge-employed" style="font-size:0.7rem;"><i class="fa-solid fa-shield-check"></i> STATE VERIFIED CANDIDATE</span>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.75rem; color:#64748b; font-weight:700;">Digital Skill Passport</div>
          <code style="font-size:1rem; color:#2563eb; background:#eff6ff; padding:0.2rem 0.5rem; border-radius:var(--radius-sm);">${s.digitalSkillPassportId}</code>
        </div>
      </div>

      <!-- Verified Skills -->
      <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:0.5rem;"><i class="fa-solid fa-award"></i> Verified Technical Competencies & Endorsements</h4>
      <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.25rem;">
        ${(s.skills || []).map(sk => `
          <span class="badge-pill info" style="font-size:0.75rem;">
            <i class="fa-solid fa-check"></i> ${typeof sk === 'string' ? sk : sk.name} (${sk.level || 'Intermediate'}${sk.endorsedBy ? ` &bull; Endorsed by ${sk.endorsedBy}` : ''})
          </span>
        `).join('')}
      </div>

      <!-- Course & Project Evaluations -->
      ${subs.length > 0 ? `
        <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:0.5rem;"><i class="fa-solid fa-star"></i> Company Course & Project Performance</h4>
        <div style="background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; margin-bottom:1.25rem;">
          ${subs.map(sub => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0; border-bottom:1px solid #f1f5f9;">
              <div><strong>${sub.courseTitle}</strong>: ${sub.assignmentTitle}</div>
              <div><span class="badge-pill badge-employed">${sub.grade || 'Submitted'} (${sub.marks ? `${sub.marks}/100` : 'Under Review'})</span></div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Digital Credentials -->
      <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:0.5rem;"><i class="fa-solid fa-certificate"></i> Verified Digital Credentials</h4>
      <div style="background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; margin-bottom:1.25rem;">
        ${(s.certificates || []).map(c => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0; border-bottom:1px solid #f1f5f9;">
            <strong style="font-size:0.85rem;">${c.title}</strong>
            <span class="text-muted" style="font-size:0.75rem;">Credential ID: <code>${c.credentialId}</code> &bull; ${c.issuer}</span>
          </div>
        `).join('')}
      </div>

      <!-- Portfolio Projects -->
      <h4 style="color:var(--primary); font-size:0.95rem; margin-bottom:0.5rem;"><i class="fa-solid fa-laptop-code"></i> Portfolio Projects & Code Deliverables</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
        ${(s.projects || []).map(p => `
          <div style="padding:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm);">
            <strong style="font-size:0.9rem;">${p.title}</strong>
            <p style="font-size:0.8rem; color:#64748b; margin:0.25rem 0;">${p.description}</p>
            <div style="display:flex; gap:0.5rem;">
              <a href="${p.github}" target="_blank" class="btn btn-sm btn-outline"><i class="fa-brands fa-github"></i> Repository</a>
              <button class="btn btn-sm btn-primary" onclick="viewCandidateProjectDetails(${p.id})"><i class="fa-solid fa-laptop-file"></i> View Project Work</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
        <button class="btn btn-secondary" onclick="closeSharedModal()">Close Dossier</button>
      </div>
    </div>
  `;
  openSharedModal(`Candidate Profile: ${studentName}`, html);
}

function viewCandidateProjectDetails(projId) {
  const p = (window.SKT_STATE.student.projects || []).find(pr => pr.id === Number(projId));
  if (!p) return;
  const html = `
    <div style="padding:0.5rem;">
      <h3 style="font-size:1.25rem; font-weight:800; margin-bottom:0.5rem;">${p.title}</h3>
      <p style="font-size:0.9rem; color:#475569; margin-bottom:1rem;">${p.description}</p>
      <div style="background:#f8fafc; padding:1rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; margin-bottom:1rem;">
        <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.5rem;"><i class="fa-solid fa-microchip"></i> System Architecture & Technology Stack</h4>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
          ${(p.tech || []).map(t => `<span class="badge-pill info">${t}</span>`).join('')}
        </div>
        <div style="font-size:0.85rem; color:#334155;">
          <strong>Deployment Status:</strong> Verified &bull; <strong>Performance Latency:</strong> 42ms &bull; <strong>Daily Throughput:</strong> 14,200 events
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
        <a href="${p.github}" target="_blank" class="btn btn-outline"><i class="fa-brands fa-github"></i> View GitHub Source Code</a>
        <button class="btn btn-secondary" onclick="closeSharedModal()">Close</button>
      </div>
    </div>
  `;
  openSharedModal("Project Deliverable Architecture", html);
}

// Schedule Interview Modal
function promptScheduleInterviewModal(appId) {
  const app = window.SKT_STATE.applications.find(a => a.id === Number(appId));
  if (!app) return;

  const html = `
    <form onsubmit="submitInterviewSchedule(event, ${appId})">
      <div class="form-group"><label>Candidate Name</label><input type="text" value="${app.studentName}" disabled /></div>
      <div class="form-group"><label>Target Opening</label><input type="text" value="${app.jobTitle}" disabled /></div>
      <div class="form-row">
        <div class="form-group"><label>Interview Round Title</label><input type="text" id="siRound" value="Technical Coding & System Architecture" required /></div>
        <div class="form-group"><label>Assigned Interviewer</label><input type="text" id="siInterviewer" value="Vikram Malhotra (Lead Architect)" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Scheduled Date</label><input type="text" id="siDate" value="Tomorrow" required /></div>
        <div class="form-group"><label>Scheduled Time</label><input type="text" id="siTime" value="03:00 PM IST" required /></div>
      </div>
      <div class="form-group"><label>Online Video Meeting Link (Google Meet / Zoom)</label><input type="url" id="siLink" value="https://meet.google.com/skt-cloud-round" required /></div>
      <div class="form-group"><label>Notes / Feedback to Candidate</label><textarea id="siFeedback" rows="2">Application shortlisted based on verified skills and project repositories. Please be prepared to explain your Node.js & SQL architecture.</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">Confirm Interview & Dispatch Notification</button>
    </form>
  `;
  openSharedModal("Schedule Candidate Interview (Google Meet / Live)", html);
}

function submitInterviewSchedule(e, appId) {
  e.preventDefault();
  const interviewData = {
    round: document.getElementById('siRound').value.trim(),
    interviewer: document.getElementById('siInterviewer').value.trim(),
    date: document.getElementById('siDate').value.trim(),
    time: document.getElementById('siTime').value.trim(),
    mode: "Online (Google Meet)",
    meetingLink: document.getElementById('siLink').value.trim(),
    feedback: document.getElementById('siFeedback').value.trim()
  };

  closeSharedModal();
  window.updateApplicationStatus(appId, "Interview Scheduled", interviewData);
}

function confirmCandidateSelection(appId) {
  if (confirm("Are you sure you want to officially select and hire this candidate? This will update the student dashboard and log the placement onto the state verified ledger.")) {
    window.updateApplicationStatus(appId, "Selected");
  }
}

// ================= 5. EMPLOYER VERIFICATION LEDGER ================= //
function renderEmployerVerificationLedger(container, ind) {
  const ledger = ind.verifiedTraineesLedger || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Employer Verification Ledger (Government Trusted Data)</h2>
        <p>Confirm trainee joining, salary range, job role, and active employment duration for state retention records.</p>
      </div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Trainee Name</th><th>Digital Passport ID</th><th>Verified Job Role</th><th>Confirmed Salary</th><th>Employee Joined?</th><th>Active Duration</th><th>State Status</th></tr></thead>
          <tbody>
            ${ledger.map(t => `
              <tr>
                <td><strong>${t.studentName}</strong></td>
                <td><code>${t.passportId}</code></td>
                <td>${t.jobRole}</td>
                <td><strong class="highlight-green">${t.salaryConfirmed}</strong></td>
                <td><span class="badge-pill badge-employed"><i class="fa-solid fa-check"></i> Joined (${t.joinDate})</span></td>
                <td><strong>${t.durationMonths}</strong></td>
                <td><span class="badge-pill badge-employed">${t.verificationStatus}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ================= 6. PROFILE SETTINGS & JOB POSTINGS ================= //
function renderIndustryProfileSettings(container, ind) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Industry Profile Settings</h2><p>Manage corporate headquarters and recruitment contact details.</p></div></div>
    <div class="card" style="max-width:800px;">
      <form onsubmit="saveIndustryProfileSettings(event)">
        <div class="form-row">
          <div class="form-group"><label>Company Name</label><input type="text" id="indName" value="${ind.companyName}" required /></div>
          <div class="form-group"><label>Industry Domain</label><input type="text" id="indType" value="${ind.industryType}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Official Website</label><input type="url" id="indWebsite" value="${ind.website || ''}" required /></div>
          <div class="form-group"><label>Recruitment Email</label><input type="email" id="indEmail" value="${ind.contactEmail || ''}" required /></div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save Industry Profile</button>
      </form>
    </div>
  `;
}

function saveIndustryProfileSettings(e) {
  e.preventDefault();
  const ind = window.SKT_STATE.industry;
  ind.companyName = document.getElementById('indName').value.trim();
  ind.industryType = document.getElementById('indType').value.trim();
  ind.website = document.getElementById('indWebsite').value.trim();
  ind.contactEmail = document.getElementById('indEmail').value.trim();
  window.saveLocalSktState();
  showToast("Industry profile settings saved!", "success");
  navToIndustryView('profile');
}

function renderIndustryJobs(container, ind) {
  const jobs = ind.jobs || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Active Corporate Job Openings</h2><p>Published vacancies available to certified candidates statewide.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptPostOpening()"><i class="fa-solid fa-plus"></i> Post Opening</button>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
      ${jobs.map(j => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h3 style="font-size:1.1rem; font-weight:800;">${j.title}</h3>
            <span class="badge-pill badge-employed">${j.jobType}</span>
          </div>
          <p class="text-muted" style="font-size:0.85rem; margin:0.4rem 0;">Location: ${j.district} &bull; Package: ${j.salaryRange}</p>
          <div style="margin-bottom:0.75rem;">
            ${(j.requiredSkills || []).map(r => `<span class="badge-pill info" style="margin-right:0.2rem; font-size:0.75rem;">${r}</span>`).join('')}
          </div>
          <div style="border-top:1px solid #f1f5f9; padding-top:0.5rem; font-size:0.85rem;">
            <strong>${j.applicantsCount || 0}</strong> Candidates Applied
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptPostOpening() {
  const html = `
    <form onsubmit="submitNewJobVacancy(event)">
      <div class="form-group"><label>Job Title</label><input type="text" id="pjTitle" placeholder="e.g. Associate Data Analyst" required /></div>
      <div class="form-row">
        <div class="form-group"><label>Job Type</label><select id="pjType"><option value="Full Time">Full Time</option><option value="Internship">Internship</option></select></div>
        <div class="form-group"><label>District Location</label><input type="text" id="pjDistrict" value="Pune" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Salary Range</label><input type="text" id="pjSalary" value="₹24,000 - ₹30,000 / month" required /></div>
        <div class="form-group"><label>Experience</label><input type="text" id="pjExp" value="0-1 Year / Fresh Graduate" required /></div>
      </div>
      <div class="form-group"><label>Required Skills (comma-separated)</label><input type="text" id="pjSkills" value="Data Analytics, SQL, Excel" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Publish Vacancy</button>
    </form>
  `;
  openSharedModal("Post New Job Opening", html);
}

function submitNewJobVacancy(e) {
  e.preventDefault();
  const ind = window.SKT_STATE.industry;
  const newJ = {
    id: Date.now(),
    title: document.getElementById('pjTitle').value.trim(),
    jobType: document.getElementById('pjType').value,
    district: document.getElementById('pjDistrict').value.trim(),
    salaryRange: document.getElementById('pjSalary').value.trim(),
    experience: document.getElementById('pjExp').value.trim(),
    requiredSkills: document.getElementById('pjSkills').value.split(',').map(s => s.trim()),
    status: "Open",
    applicantsCount: 0,
    postedDate: new Date().toISOString().split('T')[0]
  };
  ind.jobs.push(newJ);
  window.saveLocalSktState();
  closeSharedModal();
  showToast("Job vacancy published and available in student search!", "success");
  navToIndustryView('jobs');
}
