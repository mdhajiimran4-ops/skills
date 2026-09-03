// employer.js - Employer Module (All 5 Tree Features with Instant Synchronous Rendering)
function getEmployerObject() {
  if (window.SKT_STATE && window.SKT_STATE.employer) {
    return window.SKT_STATE.employer;
  }
  return {
    companyName: "Tech Solutions Pvt. Ltd.",
    sector: "IT & Software",
    district: "Pune",
    phone: "+91 20 6712 3400",
    website: "https://techsolutions.co.in",
    address: "Magarpatta Cybercity, Tower 7, Pune, Maharashtra",
    verificationStatus: "Verified Partner",
    totalHired: 54,
    jobs: [],
    candidates: []
  };
}

function handleEmployerNav(subView) {
  document.querySelectorAll('#module-employer .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-employer-${subView}`);
  if (activeLi) activeLi.classList.add('active');

  const container = document.getElementById('employerContentArea');
  if (!container) return;

  const emp = getEmployerObject();
  const data = {
    company: emp,
    activeJobs: (emp.jobs || []).length,
    candidatesCount: (emp.candidates || []).length,
    totalHired: emp.totalHired || 54
  };

  // 1. Instant Synchronous Render
  renderEmployerView(subView, container, emp, data);

  // 2. Safe Background Sync
  fetch('/api/employer/dashboard')
    .then(r => r.json())
    .then(serverData => {
      if (serverData && serverData.company) {
        window.SKT_STATE.employer = serverData.company;
        if (window.saveLocalSktState) window.saveLocalSktState();
        renderEmployerView(subView, container, serverData.company, serverData);
      }
    })
    .catch(() => {});
}

function renderEmployerView(subView, container, emp, data) {
  switch (subView) {
    case 'dashboard':
      renderEmpDashboardView(container, data);
      break;
    case 'company':
      renderEmpCompanyView(container, data);
      break;
    case 'jobs':
      renderEmpJobsView(container, data);
      break;
    case 'candidates':
    case 'hiring':
      renderEmpCandidatesView(container, data);
      break;
    default:
      renderEmpDashboardView(container, data);
  }
}

function renderEmpDashboardView(container, data) {
  const comp = data.company || getEmployerObject();
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>${comp.companyName}</h2>
        <p>Verified Industry Hiring Partner &bull; ${comp.sector} &bull; ${comp.district}</p>
      </div>
      <button class="btn btn-primary" onclick="promptEmpPostJob()"><i class="fa-solid fa-plus"></i> Post Opening</button>
    </div>

    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Active Vacancies</span><strong class="stat-val">${data.activeJobs}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Applications Received</span><strong class="stat-val highlight-blue">${data.candidatesCount}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Total Placed</span><strong class="stat-val highlight-green">${data.totalHired}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Partner Status</span><strong class="stat-val" style="font-size: 1.1rem; color: #10b981;">VERIFIED</strong></div>
    </div>

    <div class="card">
      <div class="card-head space-between">
        <h3>Candidate Applications & AI Skill Match</h3>
        <button class="btn btn-sm btn-outline" onclick="navTo('employer', 'candidates')">View All</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Candidate</th><th>Position</th><th>Match Score</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${(comp.candidates || []).map(c => `
              <tr>
                <td><strong>${c.studentName}</strong></td>
                <td>${c.jobTitle}</td>
                <td><strong class="highlight-blue"><i class="fa-solid fa-brain"></i> ${c.matchScore}%</strong></td>
                <td>${c.appliedDate}</td>
                <td><span class="badge-pill ${c.status === 'Hired' ? 'badge-employed' : 'warning'}">${c.status}</span></td>
                <td>
                  <div style="display: flex; gap: 0.35rem;">
                    <button class="btn btn-sm btn-outline" onclick="interviewCandidate(${c.id})">Interview</button>
                    <button class="btn btn-sm btn-primary" onclick="hireCandidate(${c.id})">Hire</button>
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

function renderEmpCompanyView(container, data) {
  const comp = data.company || getEmployerObject();
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Company Profile</h2><p>Manage corporate headquarters, accreditation, and hiring contacts.</p></div>
    </div>
    <div class="card" style="max-width: 650px;">
      <form onsubmit="saveEmpCompany(event)">
        <div class="form-group"><label>Enterprise Name</label><input type="text" id="ecName" value="${comp.companyName}" required /></div>
        <div class="form-row">
          <div class="form-group"><label>Industry Sector</label><input type="text" id="ecSector" value="${comp.sector}" required /></div>
          <div class="form-group"><label>District Office</label><input type="text" id="ecDistrict" value="${comp.district}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Corporate Phone</label><input type="text" id="ecPhone" value="${comp.phone}" required /></div>
          <div class="form-group"><label>Website</label><input type="url" id="ecWebsite" value="${comp.website}" required /></div>
        </div>
        <div class="form-group"><label>Office Address</label><textarea id="ecAddress" rows="2">${comp.address}</textarea></div>
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Profile</button>
      </form>
    </div>
  `;
}

function saveEmpCompany(e) {
  e.preventDefault();
  const comp = window.SKT_STATE.employer;
  comp.companyName = document.getElementById('ecName').value.trim();
  comp.sector = document.getElementById('ecSector').value.trim();
  comp.district = document.getElementById('ecDistrict').value.trim();
  comp.phone = document.getElementById('ecPhone').value.trim();
  comp.website = document.getElementById('ecWebsite').value.trim();
  comp.address = document.getElementById('ecAddress').value.trim();
  if (window.saveLocalSktState) window.saveLocalSktState();

  fetch('/api/employer/company', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comp)
  }).catch(() => {});

  showToast("Company profile updated successfully!", "success");
  handleEmployerNav('company');
}

function renderEmpJobsView(container, data) {
  const comp = data.company || getEmployerObject();
  const jobs = comp.jobs || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Active Job Openings</h2><p>Published vacancies accessible to certified students statewide.</p></div>
      <button class="btn btn-primary btn-sm" onclick="promptEmpPostJob()"><i class="fa-solid fa-plus"></i> Post Opening</button>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${jobs.map(j => `
        <div class="feature-card">
          <div style="display:flex; justify-content:space-between;">
            <h3>${j.title}</h3>
            <span class="badge-pill badge-employed">${j.jobType}</span>
          </div>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0.4rem 0;">Package: ${j.salaryRange} &bull; Experience: ${j.experience}</p>
          <div style="margin: 0.5rem 0;">
            ${(j.requiredSkills || []).map(sk => `<span class="badge-pill info" style="margin-right: 0.2rem;">${sk}</span>`).join('')}
          </div>
          <p><strong>Applicants:</strong> ${j.applicantsCount || 0} Registered</p>
        </div>
      `).join('')}
    </div>
  `;
}

function promptEmpPostJob() {
  const html = `
    <form onsubmit="submitEmpJob(event)">
      <div class="form-group"><label>Job Title</label><input type="text" id="ejTitle" placeholder="e.g. Associate Backend Developer" required /></div>
      <div class="form-row">
        <div class="form-group"><label>Job Type</label><select id="ejType"><option value="Full Time">Full Time</option><option value="Internship">Internship</option><option value="Apprenticeship">Apprenticeship</option></select></div>
        <div class="form-group"><label>District</label><input type="text" id="ejDistrict" value="Pune" required /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Salary Range</label><input type="text" id="ejSalary" value="₹6.0 - ₹8.0 LPA" required /></div>
        <div class="form-group"><label>Experience</label><input type="text" id="ejExp" value="0-1 Year" required /></div>
      </div>
      <div class="form-group"><label>Required Skills (comma-separated)</label><input type="text" id="ejSkills" value="Node.js, Express, MySQL" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Publish Vacancy</button>
    </form>
  `;
  openSharedModal("Post New Job Opening", html);
}

function submitEmpJob(e) {
  e.preventDefault();
  const comp = window.SKT_STATE.employer;
  const newJ = {
    id: Date.now(),
    title: document.getElementById('ejTitle').value.trim(),
    jobType: document.getElementById('ejType').value,
    district: document.getElementById('ejDistrict').value.trim(),
    salaryRange: document.getElementById('ejSalary').value.trim(),
    experience: document.getElementById('ejExp').value.trim(),
    requiredSkills: document.getElementById('ejSkills').value.split(',').map(s => s.trim()),
    status: "Open",
    applicantsCount: 0,
    postedDate: new Date().toISOString().split('T')[0]
  };
  if (!comp.jobs) comp.jobs = [];
  comp.jobs.push(newJ);
  if (window.saveLocalSktState) window.saveLocalSktState();

  fetch('/api/employer/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJ)
  }).catch(() => {});

  closeSharedModal();
  handleEmployerNav('jobs');
  showToast("Job opening published successfully!", "success");
}

function renderEmpCandidatesView(container, data) {
  const comp = data.company || getEmployerObject();
  const candidates = comp.candidates || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Candidates Hiring Pipeline</h2><p>Shortlist, interview, and issue verified offers.</p></div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Candidate Name</th><th>Email</th><th>Target Role</th><th>Compatibility</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${candidates.map(c => `
              <tr>
                <td><strong>${c.studentName}</strong></td>
                <td>${c.studentEmail}</td>
                <td>${c.jobTitle}</td>
                <td><strong class="highlight-blue">${c.matchScore}%</strong></td>
                <td><span class="badge-pill ${c.status === 'Hired' ? 'badge-employed' : 'warning'}">${c.status}</span></td>
                <td>
                  <div style="display:flex; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline" onclick="interviewCandidate(${c.id})">Interview</button>
                    <button class="btn btn-sm btn-primary" onclick="hireCandidate(${c.id})">Hire</button>
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

function interviewCandidate(id) {
  const comp = window.SKT_STATE.employer;
  const c = (comp.candidates || []).find(cand => cand.id === id);
  if (c) {
    c.status = "Interview Scheduled";
    if (window.saveLocalSktState) window.saveLocalSktState();
    showToast(`Interview scheduled for ${c.studentName}!`, 'info');
    handleEmployerNav('candidates');
  }
}

function hireCandidate(id) {
  const comp = window.SKT_STATE.employer;
  const c = (comp.candidates || []).find(cand => cand.id === id);
  if (c) {
    c.status = "Hired";
    comp.totalHired = (comp.totalHired || 54) + 1;
    if (window.saveLocalSktState) window.saveLocalSktState();
    showToast(`Formal offer accepted! ${c.studentName} is hired!`, 'success');
    handleEmployerNav('candidates');
  }
}
