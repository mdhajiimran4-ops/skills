// admin.js - Admin Portal (Dashboard, Separate Profile Settings, User Governance & RBAC)
function navToAdminView(subView) {
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-admin');
  if (screen) screen.style.display = 'grid';

  document.querySelectorAll('#screen-admin .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-admin-${subView}`);
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

  const container = document.getElementById('adminContentArea');
  if (!container) return;

  const adm = window.SKT_STATE.admin;

  switch (subView) {
    case 'dashboard': renderAdminDashboard(container, adm); break;
    case 'profile': renderAdminProfileSettings(container, adm); break;
    case 'users': renderAdminUsers(container, adm); break;
    case 'permissions': renderAdminPermissions(container, adm); break;
    case 'skills': renderAdminSkills(container, adm); break;
    case 'auditlogs': renderAdminAuditLogs(container, adm); break;
    default: renderAdminDashboard(container, adm);
  }

  window.location.hash = `admin/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToAdminView = navToAdminView;

// 1. Admin Dashboard
function renderAdminDashboard(container, adm) {
  const users = adm.users || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Master Admin Governance Dashboard</h2>
        <p><i class="fa-solid fa-shield-halved"></i> Platform Security & Multi-Role Access Control Console</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary" onclick="navToAdminView('profile')"><i class="fa-solid fa-gear"></i> Admin Profile Settings</button>
      </div>
    </div>

    <!-- Admin Macro Stats -->
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Total Accounts Managed</span><strong class="stat-val">${users.length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Active RBAC Roles</span><strong class="stat-val highlight-blue">5 Roles</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Security Clearance</span><strong class="stat-val highlight-green">Level 5</strong></div>
      <div class="dash-stat-card"><span class="stat-label">System Integrity</span><div style="margin-top:0.35rem;"><span class="badge-employed">ENFORCED</span></div></div>
    </div>

    <div class="card">
      <div class="card-head space-between">
        <h3>Master User Directory (Across All 5 Roles)</h3>
        <button class="btn btn-sm btn-outline" onclick="navToAdminView('users')">Manage Users &rarr;</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>User ID</th><th>Identity Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>#${u.id}</td>
                <td><strong>${u.name || u.email}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge-pill info">${u.role.toUpperCase()}</span></td>
                <td><span class="badge-pill ${u.status === 'active' ? 'badge-employed' : 'danger'}">${u.status.toUpperCase()}</span></td>
                <td>
                  ${u.status === 'active' ? `
                    <button class="btn btn-sm btn-danger" onclick="toggleUserStatus(${u.id}, 'suspended')">Suspend</button>
                  ` : `
                    <button class="btn btn-sm btn-success" onclick="toggleUserStatus(${u.id}, 'active')">Reactivate</button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Separate Admin Profile Settings (Security & Account Settings)
function renderAdminProfileSettings(container, adm) {
  const sec = adm.securitySettings || {};
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Admin Profile & Security Settings</h2>
        <p>Manage administrator credentials, two-factor authentication, security policies, and session safeguards.</p>
      </div>
    </div>

    <div class="card" style="max-width: 800px;">
      <form onsubmit="saveAdminProfileSettings(event)">
        <h4 style="margin-bottom: 0.75rem; color: var(--primary);"><i class="fa-solid fa-user-gear"></i> Administrative Identity</h4>
        <div class="form-row">
          <div class="form-group"><label>Administrator Name</label><input type="text" id="admName" value="${adm.name}" required /></div>
          <div class="form-group"><label>Security Email</label><input type="email" id="admEmail" value="${adm.email}" required /></div>
        </div>
        <div class="form-group">
          <label>Authorization Level</label>
          <input type="text" value="${adm.roleLevel || 'Super Administrator (Level 5 Clearance)'}" disabled />
        </div>

        <h4 style="margin: 1.25rem 0 0.75rem; color: var(--primary);"><i class="fa-solid fa-lock"></i> Account & Security Configuration</h4>
        <div class="form-group">
          <label>IP Access Whitelist</label>
          <input type="text" id="admIp" value="${sec.ipWhitelist || '10.0.0.0/8, 192.168.1.0/24'}" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Two-Factor Authentication (2FA)</label>
            <select id="adm2fa">
              <option value="true" ${sec.twoFactorEnabled ? 'selected' : ''}>Enforced (TOTP Hardware Key)</option>
              <option value="false" ${!sec.twoFactorEnabled ? 'selected' : ''}>Disabled</option>
            </select>
          </div>
          <div class="form-group">
            <label>Security Audit Notifications</label>
            <select id="admAlerts">
              <option value="true" ${sec.auditAlerts ? 'selected' : ''}>Real-time Email Alerts</option>
              <option value="false" ${!sec.auditAlerts ? 'selected' : ''}>Daily Digest Only</option>
            </select>
          </div>
        </div>

        <h4 style="margin: 1.25rem 0 0.75rem; color: var(--primary);"><i class="fa-solid fa-key"></i> Password Change</h4>
        <div class="form-row">
          <div class="form-group"><label>New Master Password</label><input type="password" placeholder="Leave blank to keep unchanged" /></div>
          <div class="form-group"><label>Confirm New Password</label><input type="password" placeholder="Confirm password" /></div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save Admin Settings</button>
      </form>
    </div>
  `;
}

function saveAdminProfileSettings(e) {
  e.preventDefault();
  const adm = window.SKT_STATE.admin;
  adm.name = document.getElementById('admName').value.trim();
  adm.email = document.getElementById('admEmail').value.trim();

  if (!adm.securitySettings) adm.securitySettings = {};
  adm.securitySettings.ipWhitelist = document.getElementById('admIp').value.trim();
  adm.securitySettings.twoFactorEnabled = document.getElementById('adm2fa').value === 'true';
  adm.securitySettings.auditAlerts = document.getElementById('admAlerts').value === 'true';

  if (window.SKT_STATE.currentUser) {
    window.SKT_STATE.currentUser.name = adm.name;
    localStorage.setItem('skt_session_user', JSON.stringify(window.SKT_STATE.currentUser));
  }

  const topName = document.getElementById('topNavUserName');
  if (topName) topName.textContent = adm.name;

  if (window.saveLocalSktState) window.saveLocalSktState();
  showToast("Admin profile and security settings saved!", "success");
  navToAdminView('profile');
}

// 3. User Governance
function renderAdminUsers(container, adm) {
  const users = adm.users || [];
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Master User Accounts Governance</h2><p>Authorize, audit, and regulate accounts across all 5 platform roles.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>User ID</th><th>Name / Identity</th><th>Email Address</th><th>Role</th><th>Status</th><th>Governance Action</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>#${u.id}</td>
                <td><strong>${u.name || u.email}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge-pill info">${u.role.toUpperCase()}</span></td>
                <td><span class="badge-pill ${u.status === 'active' ? 'badge-employed' : 'danger'}">${u.status.toUpperCase()}</span></td>
                <td>
                  ${u.status === 'active' ? `
                    <button class="btn btn-sm btn-danger" onclick="toggleUserStatus(${u.id}, 'suspended')">Suspend</button>
                  ` : `
                    <button class="btn btn-sm btn-success" onclick="toggleUserStatus(${u.id}, 'active')">Reactivate</button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function toggleUserStatus(userId, status) {
  const users = window.SKT_STATE.admin.users;
  const u = users.find(user => user.id === userId);
  if (u) {
    u.status = status;
    if (window.saveLocalSktState) window.saveLocalSktState();
    showToast(`Account for ${u.email} has been set to ${status}!`, 'info');
    renderAdminUsers(document.getElementById('adminContentArea'), window.SKT_STATE.admin);
  }
}

// 4. Role Permissions (RBAC)
function renderAdminPermissions(container, adm) {
  const perms = adm.permissions || [];
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Role-Based Access Control (RBAC) Policy Matrix</h2><p>Security permission boundaries across all 5 platform roles.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Platform Role</th><th>Profile Settings</th><th>Job Application</th><th>Vacancy Posting</th><th>Credential Signing</th><th>State Reports</th></tr></thead>
          <tbody>
            ${perms.map(p => `
              <tr>
                <td><strong>${p.role.toUpperCase()}</strong></td>
                <td>${p.viewProfile ? '<i class="fa-solid fa-check text-green"></i>' : '<i class="fa-solid fa-xmark text-muted"></i>'}</td>
                <td>${p.applyJobs ? '<i class="fa-solid fa-check text-green"></i>' : '<i class="fa-solid fa-xmark text-muted"></i>'}</td>
                <td>${p.postJobs ? '<i class="fa-solid fa-check text-green"></i>' : '<i class="fa-solid fa-xmark text-muted"></i>'}</td>
                <td>${p.approveCertificates ? '<i class="fa-solid fa-check text-green"></i>' : '<i class="fa-solid fa-xmark text-muted"></i>'}</td>
                <td>${p.viewStateReports ? '<i class="fa-solid fa-check text-green"></i>' : '<i class="fa-solid fa-xmark text-muted"></i>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 5. Skills Taxonomy
function renderAdminSkills(container, adm) {
  const skills = adm.skillsTaxonomy || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Statewide Technical Skills Taxonomy</h2><p>Standardized skills directory aligned with industry benchmarks.</p></div>
      <button class="btn btn-primary btn-sm" onclick="promptAddTaxonomy()"><i class="fa-solid fa-plus"></i> Add Taxonomy Entry</button>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Skill Term</th><th>Taxonomy Category</th><th>State Demand Index</th><th>Curriculums</th></tr></thead>
          <tbody>
            ${skills.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.category}</td>
                <td><span class="badge-pill info">${s.demand}</span></td>
                <td>${s.activeCourses} Active Courses</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptAddTaxonomy() {
  const name = prompt("Enter standardized skill term (e.g. Kubernetes, Rust):");
  if (name && name.trim()) {
    const adm = window.SKT_STATE.admin;
    adm.skillsTaxonomy.push({ id: Date.now(), name: name.trim(), category: "Technology", demand: "High", activeCourses: 1 });
    if (window.saveLocalSktState) window.saveLocalSktState();
    showToast(`Skill "${name.trim()}" added to state taxonomy!`, 'success');
    renderAdminSkills(document.getElementById('adminContentArea'), adm);
  }
}

// 6. Audit Logs
function renderAdminAuditLogs(container, adm) {
  const logs = adm.auditLogs || [];
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Immutable System Audit Telemetry</h2><p>Cryptographic transaction events and administrative access records.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Event ID</th><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target Entity</th><th>Status</th></tr></thead>
          <tbody>
            ${logs.map(l => `
              <tr>
                <td>#${l.id}</td>
                <td>${l.timestamp}</td>
                <td><strong>${l.actor}</strong></td>
                <td><code>${l.action}</code></td>
                <td>${l.target}</td>
                <td><span class="badge-employed">${l.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
