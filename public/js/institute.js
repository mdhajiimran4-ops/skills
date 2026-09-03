// institute.js - Training Institute Module (Instant Synchronous Rendering)
function getInstituteObject() {
  if (window.SKT_STATE && window.SKT_STATE.institute) {
    return window.SKT_STATE.institute;
  }
  return {
    name: "Government Polytechnic & IT Institute (GBIT)",
    accreditationNumber: "MSSDS-INST-2021-089",
    district: "Pune",
    stats: { enrolled: 4250, certified: 3620, placed: 3180, placementRate: "87.8%", avgSalary: "₹26,500/mo" },
    courses: [],
    assessments: [],
    issuedCertificates: []
  };
}

function handleInstituteNav(subView) {
  document.querySelectorAll('#module-institute .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-institute-${subView}`);
  if (activeLi) activeLi.classList.add('active');

  const container = document.getElementById('instituteContentArea');
  if (!container) return;

  const inst = getInstituteObject();
  const data = { institute: inst, stats: inst.stats };

  // 1. Instant Synchronous Render
  renderInstituteView(subView, container, inst, data);

  // 2. Safe Background Sync
  fetch('/api/institute/dashboard')
    .then(r => r.json())
    .then(serverData => {
      if (serverData && serverData.institute) {
        window.SKT_STATE.institute = serverData.institute;
        if (window.saveLocalSktState) window.saveLocalSktState();
        renderInstituteView(subView, container, serverData.institute, serverData);
      }
    })
    .catch(() => {});
}

function renderInstituteView(subView, container, inst, data) {
  switch (subView) {
    case 'dashboard':
      renderInstDashboardView(container, data);
      break;
    case 'students':
      renderInstStudentsView(container);
      break;
    case 'courses':
    case 'training':
      renderInstCoursesView(container, data);
      break;
    case 'assessments':
      renderInstAssessmentsView(container);
      break;
    case 'certificates':
      renderInstCertificatesView(container);
      break;
    case 'outcomes':
      renderInstOutcomesView(container, data);
      break;
    default:
      renderInstDashboardView(container, data);
  }
}

function renderInstDashboardView(container, data) {
  const inst = data.institute || getInstituteObject();
  const s = data.stats || inst.stats || { enrolled: 4250, certified: 3620, placed: 3180, placementRate: "87.8%", avgSalary: "₹26,500/mo" };

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>${inst.name}</h2>
        <p>Accreditation: <strong>${inst.accreditationNumber}</strong> &bull; District: <strong>${inst.district}</strong></p>
      </div>
      <button class="btn btn-primary" onclick="promptAddCourse()"><i class="fa-solid fa-plus"></i> Launch Course</button>
    </div>

    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Total Enrolled</span><strong class="stat-val">${s.enrolled}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Certified Graduates</span><strong class="stat-val">${s.certified}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Placed in Industry</span><strong class="stat-val highlight-green">${s.placed}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Placement Rate</span><strong class="stat-val highlight-blue">${s.placementRate}</strong></div>
    </div>

    <div class="card">
      <div class="card-head space-between">
        <h3>Active State-Subsidized Courses</h3>
        <button class="btn btn-sm btn-outline" onclick="navTo('institute', 'courses')">View All</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Course Title</th><th>Category</th><th>Duration</th><th>Intake</th><th>Fee / Subsidy</th><th>Action</th></tr></thead>
          <tbody>
            ${(inst.courses || []).map(c => `
              <tr>
                <td><strong>${c.title}</strong></td>
                <td>${c.category}</td>
                <td>${c.durationWeeks} Weeks</td>
                <td>${c.intake} Seats</td>
                <td><span class="badge-pill info">${c.fee}</span></td>
                <td><button class="btn btn-sm btn-primary" onclick="promptLogAssessment(${c.id})">Log Exam</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderInstStudentsView(container) {
  const students = [
    { id: 1, fullName: "Rohit Patil", email: "rohit.patil@skilltrack.org", district: "Pune", employmentStatus: "employed", course: "Full Stack Web Development" },
    { id: 2, fullName: "Ayesha Naaz", email: "ayesha.n@gmail.com", district: "Pune", employmentStatus: "placed", course: "Advanced Cloud Computing" },
    { id: 3, fullName: "Rahul Verma", email: "rahul.v@gmail.com", district: "Nagpur", employmentStatus: "in_training", course: "Python Programming" }
  ];

  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Enrolled Students Registry</h2><p>Candidate cohort telemetry and graduation status.</p></div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Email</th><th>Course</th><th>District</th><th>Status</th><th>Credential</th></tr></thead>
          <tbody>
            ${students.map(s => `
              <tr>
                <td><strong>${s.fullName}</strong></td>
                <td>${s.email}</td>
                <td>${s.course}</td>
                <td>${s.district}</td>
                <td><span class="badge-employed">${s.employmentStatus.toUpperCase()}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="promptIssueCertificate('${s.fullName}')">Issue Certificate</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderInstCoursesView(container, data) {
  const inst = data.institute || getInstituteObject();
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Accredited Training Curriculums</h2><p>State-approved vocational courses conducted by this institute.</p></div>
      <button class="btn btn-primary btn-sm" onclick="promptAddCourse()"><i class="fa-solid fa-plus"></i> Launch Course</button>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${(inst.courses || []).map(c => `
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-book"></i></div>
          <h3>${c.title}</h3>
          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">${c.category} &bull; ${c.durationWeeks} Weeks &bull; Intake: ${c.intake}</p>
          <p style="font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.75rem;">${c.syllabus}</p>
          <div><strong>Funding:</strong> <span class="badge-pill info">${c.fee}</span></div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptAddCourse() {
  const html = `
    <form onsubmit="submitNewCourse(event)">
      <div class="form-group"><label>Course Title</label><input type="text" id="ncTitle" placeholder="e.g. Embedded IoT & Robotics" required /></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><input type="text" id="ncCategory" value="Hardware & IoT" required /></div>
        <div class="form-group"><label>Duration (Weeks)</label><input type="number" id="ncDuration" value="12" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Intake Capacity</label><input type="number" id="ncIntake" value="60" required /></div>
        <div class="form-group"><label>Funding / Fee</label><input type="text" id="ncFee" value="Government Subsidized" required /></div>
      </div>
      <div class="form-group"><label>Syllabus Summary</label><textarea id="ncSyllabus" rows="2" placeholder="Key topics covered..."></textarea></div>
      <button type="submit" class="btn btn-primary btn-block">Publish Course</button>
    </form>
  `;
  openSharedModal("Launch New State Training Course", html);
}

function submitNewCourse(e) {
  e.preventDefault();
  const inst = window.SKT_STATE.institute;
  const newC = {
    id: Date.now(),
    title: document.getElementById('ncTitle').value.trim(),
    category: document.getElementById('ncCategory').value.trim(),
    durationWeeks: parseInt(document.getElementById('ncDuration').value) || 12,
    intake: parseInt(document.getElementById('ncIntake').value) || 60,
    fee: document.getElementById('ncFee').value.trim(),
    syllabus: document.getElementById('ncSyllabus').value.trim()
  };
  if (!inst.courses) inst.courses = [];
  inst.courses.push(newC);
  if (window.saveLocalSktState) window.saveLocalSktState();

  fetch('/api/institute/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newC)
  }).catch(() => {});

  closeSharedModal();
  handleInstituteNav('courses');
  showToast("Course launched and accredited!", "success");
}

function renderInstAssessmentsView(container) {
  const inst = getInstituteObject();
  const assessments = inst.assessments || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Practical Exam Assessments</h2><p>Candidate evaluation and pass-rate metrics.</p></div>
      <button class="btn btn-primary btn-sm" onclick="promptLogAssessment(1)"><i class="fa-solid fa-plus"></i> Log Exam</button>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Assessment Title</th><th>Date</th><th>Candidates</th><th>Passed</th><th>Pass Rate</th></tr></thead>
          <tbody>
            ${assessments.map(a => `
              <tr>
                <td><strong>${a.title}</strong></td>
                <td>${a.date}</td>
                <td>${a.totalStudents}</td>
                <td>${a.passed}</td>
                <td><strong class="highlight-green">${a.passRate}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptLogAssessment(courseId) {
  const html = `
    <form onsubmit="submitExamAssessment(event)">
      <div class="form-group"><label>Exam / Assessment Title</label><input type="text" id="neTitle" value="Mid-Term Practical Evaluation" required /></div>
      <div class="form-row">
        <div class="form-group"><label>Total Candidates Examined</label><input type="number" id="neTotal" value="120" required /></div>
        <div class="form-group"><label>Candidates Passed</label><input type="number" id="nePassed" value="114" required /></div>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Log Exam Records</button>
    </form>
  `;
  openSharedModal("Log Examination & Assessment Metric", html);
}

function submitExamAssessment(e) {
  e.preventDefault();
  const inst = window.SKT_STATE.institute;
  const tot = parseInt(document.getElementById('neTotal').value) || 100;
  const pass = parseInt(document.getElementById('nePassed').value) || 90;
  const exam = {
    id: Date.now(),
    title: document.getElementById('neTitle').value.trim(),
    date: new Date().toISOString().split('T')[0],
    totalStudents: tot,
    passed: pass,
    passRate: `${((pass / tot) * 100).toFixed(1)}%`
  };
  if (!inst.assessments) inst.assessments = [];
  inst.assessments.unshift(exam);
  if (window.saveLocalSktState) window.saveLocalSktState();

  fetch('/api/institute/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exam)
  }).catch(() => {});

  closeSharedModal();
  handleInstituteNav('assessments');
  showToast("Exam assessment record logged!", "success");
}

function renderInstCertificatesView(container) {
  const inst = getInstituteObject();
  const certs = inst.issuedCertificates || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Issued Digital Certificates</h2><p>Official cryptographic credentials signed by GBIT Pune.</p></div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Student</th><th>Credential Title</th><th>Issue Date</th><th>Serial ID</th><th>Status</th></tr></thead>
          <tbody>
            ${certs.map(c => `
              <tr>
                <td><strong>${c.studentName}</strong></td>
                <td>${c.title}</td>
                <td>${c.issueDate}</td>
                <td><code>${c.credentialId}</code></td>
                <td><span class="badge-employed">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptIssueCertificate(studentName) {
  const title = prompt(`Issue credential for ${studentName} (Enter course title):`, "Full Stack Web Development");
  if (title && title.trim()) {
    const inst = window.SKT_STATE.institute;
    const credId = `MS-INST-${Date.now().toString().slice(-5)}`;
    const newCert = {
      id: Date.now(),
      studentName,
      title: title.trim(),
      issueDate: new Date().toISOString().split('T')[0],
      credentialId: credId,
      status: "Verified"
    };
    if (!inst.issuedCertificates) inst.issuedCertificates = [];
    inst.issuedCertificates.unshift(newCert);
    if (window.saveLocalSktState) window.saveLocalSktState();

    showToast(`Certificate ${credId} issued to ${studentName}!`, 'success');
    handleInstituteNav('certificates');
  }
}

function renderInstOutcomesView(container, data) {
  const s = (data.institute && data.institute.stats) ? data.institute.stats : getInstituteObject().stats;
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Institutional Training Outcomes</h2><p>Longitudinal metrics on graduation, placement, and wage levels.</p></div>
    </div>
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Graduation Rate</span><strong class="stat-val highlight-green">85.2%</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Placement Conversion</span><strong class="stat-val highlight-blue">${s.placementRate}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Average Trainee Wage</span><strong class="stat-val">${s.avgSalary}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Accreditation Score</span><strong class="stat-val" style="color: #8b5cf6;">96.4/100</strong></div>
    </div>
  `;
}
