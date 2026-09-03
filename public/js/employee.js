// employee.js - Employee Portal (Dashboard, Separate Profile Settings, Student Mentorship & Skill Endorsements)
function navToEmployeeView(subView) {
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-employee');
  if (screen) screen.style.display = 'grid';

  document.querySelectorAll('#screen-employee .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-employee-${subView}`);
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

  const container = document.getElementById('employeeContentArea');
  if (!container) return;

  const emp = window.SKT_STATE.employee;

  switch (subView) {
    case 'dashboard': renderEmployeeDashboard(container, emp); break;
    case 'profile': renderEmployeeProfileSettings(container, emp); break;
    case 'mentees': renderEmployeeMentees(container, emp); break;
    case 'endorsements': renderEmployeeEndorsements(container, emp); break;
    default: renderEmployeeDashboard(container, emp);
  }

  window.location.hash = `employee/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToEmployeeView = navToEmployeeView;

// 1. Employee Dashboard
function renderEmployeeDashboard(container, emp) {
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Welcome, ${emp.name}! 👋</h2>
        <p><i class="fa-solid fa-briefcase"></i> ${emp.designation} &bull; ${emp.organization}</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary" onclick="navToEmployeeView('profile')"><i class="fa-solid fa-id-card-clip"></i> Profile Settings</button>
      </div>
    </div>

    <!-- Employee Stats -->
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Assigned Mentees</span><strong class="stat-val">${(emp.mentees || []).length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Skill Endorsements Pending</span><strong class="stat-val highlight-blue">${(emp.endorsementsPending || []).length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Department</span><div style="margin-top:0.35rem; font-size:0.85rem; font-weight:700;">${emp.department}</div></div>
      <div class="dash-stat-card"><span class="stat-label">Mentor Status</span><div style="margin-top:0.35rem;"><span class="badge-employed">ACTIVE MENTOR</span></div></div>
    </div>

    <div class="card">
      <div class="card-head space-between">
        <h3>Assigned Student Trainees & Mentorship</h3>
        <button class="btn btn-sm btn-outline" onclick="navToEmployeeView('mentees')">Manage All &rarr;</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Student Candidate</th><th>Mentorship Focus Topic</th><th>Session Schedule</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${(emp.mentees || []).map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.topic}</td>
                <td>${m.nextSession}</td>
                <td><span class="badge-pill ${m.status === 'Active Mentee' ? 'badge-employed' : 'warning'}">${m.status}</span></td>
                <td><button class="btn btn-sm btn-primary" onclick="showToast('Session invite dispatched to ${m.name}', 'info')">Join Session</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Separate Employee Profile Settings
function renderEmployeeProfileSettings(container, emp) {
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Employee Profile Settings</h2>
        <p>Update your professional identity, organization, department, and mentorship details.</p>
      </div>
    </div>

    <div class="card" style="max-width: 800px;">
      <!-- Profile Photo Upload -->
      <div style="display:flex; align-items:center; gap:1.5rem; padding-bottom:1.5rem; margin-bottom:1.5rem; border-bottom:1px solid var(--border);">
        <div class="profile-avatar-container">
          <img id="employeeAvatarImg" class="profile-hero-avatar" src="${emp.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}" alt="${emp.name}" onerror="handleAvatarError(this)" />
          <button type="button" class="btn-avatar-camera" onclick="triggerAvatarPicker()" title="Upload professional photo">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800;">${emp.name}</h3>
          <p class="text-muted" style="font-size: 0.85rem;"><i class="fa-solid fa-building"></i> ${emp.organization} &bull; ${emp.department}</p>
          <button type="button" class="btn btn-outline btn-sm" style="margin-top: 0.5rem;" onclick="triggerAvatarPicker()"><i class="fa-solid fa-camera"></i> Change Photo</button>
        </div>
      </div>

      <form onsubmit="saveEmployeeProfileSettings(event)">
        <h4 style="margin-bottom: 0.75rem; color: var(--primary);"><i class="fa-solid fa-user-tie"></i> Professional Identity</h4>
        <div class="form-row">
          <div class="form-group"><label>Employee Full Name</label><input type="text" id="empName" value="${emp.name}" required /></div>
          <div class="form-group"><label>Designation / Job Role</label><input type="text" id="empDesignation" value="${emp.designation}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Department / Team</label><input type="text" id="empDepartment" value="${emp.department}" required /></div>
          <div class="form-group"><label>Organization / Company</label><input type="text" id="empOrganization" value="${emp.organization}" required /></div>
        </div>

        <h4 style="margin: 1.25rem 0 0.75rem; color: var(--primary);"><i class="fa-solid fa-address-card"></i> Contact & Social Network</h4>
        <div class="form-row">
          <div class="form-group"><label>Corporate Email Address</label><input type="email" value="${emp.email}" disabled /></div>
          <div class="form-group"><label>Phone Number</label><input type="text" id="empPhone" value="${emp.phone || ''}" required /></div>
        </div>
        <div class="form-group">
          <label><i class="fa-brands fa-linkedin text-primary"></i> LinkedIn Profile URL</label>
          <input type="url" id="empLinkedin" value="${emp.linkedinUrl || ''}" placeholder="https://linkedin.com/in/your-profile" required />
        </div>

        <h4 style="margin: 1.25rem 0 0.75rem; color: var(--primary);"><i class="fa-solid fa-file-lines"></i> Professional Background & Mentorship</h4>
        <div class="form-group">
          <label>Professional Details / Bio (Visible to Student Trainees)</label>
          <textarea id="empDetails" rows="3">${emp.professionalDetails || ''}</textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save Employee Profile</button>
      </form>
    </div>
  `;
}

function saveEmployeeProfileSettings(e) {
  e.preventDefault();
  const emp = window.SKT_STATE.employee;
  emp.name = document.getElementById('empName').value.trim();
  emp.designation = document.getElementById('empDesignation').value.trim();
  emp.department = document.getElementById('empDepartment').value.trim();
  emp.organization = document.getElementById('empOrganization').value.trim();
  emp.phone = document.getElementById('empPhone').value.trim();
  emp.linkedinUrl = document.getElementById('empLinkedin').value.trim();
  emp.professionalDetails = document.getElementById('empDetails').value.trim();

  if (window.SKT_STATE.currentUser) {
    window.SKT_STATE.currentUser.name = emp.name;
    localStorage.setItem('skt_session_user', JSON.stringify(window.SKT_STATE.currentUser));
  }

  const topName = document.getElementById('topNavUserName');
  if (topName) topName.textContent = emp.name;

  if (window.saveLocalSktState) window.saveLocalSktState();
  showToast("Employee profile settings saved successfully!", "success");
  navToEmployeeView('profile');
}

// 3. Student Mentees
function renderEmployeeMentees(container, emp) {
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Student Mentees Under Guidance</h2><p>Trainee projects and scheduled technical reviews.</p></div>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${(emp.mentees || []).map(m => `
        <div class="feature-card">
          <h3>${m.name}</h3>
          <p class="text-muted" style="font-size:0.85rem; margin:0.3rem 0;">Focus Topic: <strong>${m.topic}</strong></p>
          <p style="font-size:0.85rem;"><strong>Next Session:</strong> ${m.nextSession}</p>
          <div style="margin-top:0.75rem; display:flex; gap:0.4rem;">
            <button class="btn btn-sm btn-primary" onclick="showToast('Calendar link sent to ${m.name}', 'success')">Schedule Session</button>
            <button class="btn btn-sm btn-outline" onclick="showToast('Portfolio code approved', 'info')">Review Code</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 4. Skill Endorsements
function renderEmployeeEndorsements(container, emp) {
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Skill Endorsements Queue</h2><p>Endorse student technical competencies for official state credentials.</p></div>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Candidate</th><th>Competency to Endorse</th><th>Date Requested</th><th>Action</th></tr></thead>
          <tbody>
            ${(emp.endorsementsPending || []).map(ep => `
              <tr>
                <td><strong>${ep.studentName}</strong></td>
                <td><span class="badge-pill info">${ep.skill}</span></td>
                <td>${ep.date}</td>
                <td><button class="btn btn-sm btn-success" onclick="endorseStudentSkill('${ep.studentName}', '${ep.skill}')"><i class="fa-solid fa-check"></i> Endorse Skill</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function endorseStudentSkill(studentName, skill) {
  showToast(`Officially endorsed "${skill}" for ${studentName}!`, 'success');
}
