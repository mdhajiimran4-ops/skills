// faculty.js - SKILLTRACK Dedicated Faculty & Academic Mentor Portal
let currentFacultySubView = 'dashboard';

function navToFacultyView(subView, optParam) {
  currentFacultySubView = subView || 'dashboard';

  // Display faculty screen and hide all others
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-faculty');
  if (screen) screen.style.display = 'grid';

  // Update active sidebar link
  document.querySelectorAll('#screen-faculty .sidebar-menu li').forEach(li => {
    li.classList.remove('active');
  });
  const activeLi = document.getElementById(`smenu-faculty-${subView}`);
  if (activeLi) activeLi.classList.add('active');

  // Update top role nav bar buttons
  const rDashboard = document.getElementById('rnav-dashboard');
  const rSettings = document.getElementById('rnav-settings');
  if (subView === 'profile') {
    if (rDashboard) rDashboard.classList.remove('active');
    if (rSettings) rSettings.classList.add('active');
  } else {
    if (rDashboard) rDashboard.classList.add('active');
    if (rSettings) rSettings.classList.remove('active');
  }

  const container = document.getElementById('facultyContentArea');
  if (!container) return;

  const f = (window.getLoggedInFaculty ? window.getLoggedInFaculty() : null) 
    || ((window.SKT_STATE && window.SKT_STATE.faculty) ? window.SKT_STATE.faculty[0] : null) 
    || { facultyId: 'FAC-101', name: 'Prof. Arvind Joshi', department: 'Computer Science & Cloud Systems', email: 'arvind.joshi@faculty.skilltrack.org', officeHours: 'Mon-Fri 2:00 PM - 5:00 PM', assignedStudentIds: [1, 2] };

  switch (subView) {
    case 'dashboard': renderFacultyDashboard(container, f); break;
    case 'students': renderFacultyStudents(container, f); break;
    case 'courses': renderFacultyCourses(container, f); break;
    case 'assignments': renderFacultyAssignments(container, f); break;
    case 'quizzes': renderFacultyQuizzes(container, f); break;
    case 'grading': renderFacultySubmissions(container, f); break;
    case 'announcements': renderFacultyAnnouncements(container, f); break;
    case 'profile': renderFacultyProfile(container, f); break;
    default: renderFacultyDashboard(container, f);
  }

  window.location.hash = `faculty/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToFacultyView = navToFacultyView;

// ================= 1. FACULTY DASHBOARD ================= //
function renderFacultyDashboard(container, f) {
  const assignedStudents = window.getFacultyAssignedStudents(f.facultyId);
  const myAnnouncements = (window.SKT_STATE.facultyAnnouncements || []).filter(a => a.facultyId === f.facultyId);
  const assignedIds = assignedStudents.map(s => s.id);
  const pendingSubs = (window.SKT_STATE.courseSubmissions || []).filter(s => assignedIds.includes(s.studentId));

  container.innerHTML = `
    <!-- Faculty Profile Banner -->
    <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); color:#fff; border:none; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; gap:1.25rem; align-items:center;">
          <img src="${f.avatarUrl}" onerror="handleAvatarError(this)" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid #818cf8;" />
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span class="badge-pill" style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.75rem;"><i class="fa-solid fa-chalkboard-user"></i> ACADEMIC FACULTY MENTOR</span>
              <span class="badge-pill badge-employed" style="font-size:0.75rem; font-family:monospace;"><i class="fa-solid fa-id-badge"></i> ${f.facultyId}</span>
            </div>
            <h2 style="font-size:1.5rem; font-weight:800; color:#fff; margin-bottom:0.2rem;">${f.name}</h2>
            <p style="color:#c7d2fe; font-size:0.85rem; margin:0;">${f.department} &bull; ${f.designation}</p>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-sm btn-primary" onclick="promptFacultyAnnouncementModal()" style="background:#4f46e5; border-color:#6366f1;"><i class="fa-solid fa-bullhorn"></i> Post Announcement</button>
          <button class="btn btn-sm btn-outline" onclick="navToFacultyView('students')" style="color:#fff; border-color:rgba(255,255,255,0.4);"><i class="fa-solid fa-users"></i> View Assigned Cohort</button>
        </div>
      </div>
    </div>

    <!-- Faculty Key Stats -->
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card">
        <span class="stat-label">Assigned Students</span>
        <strong class="stat-val highlight-blue">${assignedStudents.length} Students</strong>
      </div>
      <div class="dash-stat-card">
        <span class="stat-label">Cohort Avg Attendance</span>
        <strong class="stat-val highlight-green">92.5%</strong>
      </div>
      <div class="dash-stat-card">
        <span class="stat-label">Submissions to Review</span>
        <strong class="stat-val highlight-purple">${pendingSubs.length}</strong>
      </div>
      <div class="dash-stat-card">
        <span class="stat-label">Active Academic Notices</span>
        <strong class="stat-val highlight-green">${myAnnouncements.length}</strong>
      </div>
    </div>

    <!-- Assigned Students Quick Table -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-head space-between">
        <div>
          <h3><i class="fa-solid fa-user-graduate text-primary"></i> My Assigned Students (Cohort ${f.facultyId})</h3>
          <p class="text-muted" style="font-size:0.85rem; margin:0.2rem 0 0;">Students directly assigned to your academic mentorship and placement review.</p>
        </div>
        <button class="btn btn-sm btn-primary" onclick="navToFacultyView('students')">Manage All (${assignedStudents.length}) &rarr;</button>
      </div>

      <div class="table-responsive" style="margin-top:1rem;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course / Branch</th>
              <th>Attendance</th>
              <th>CGPA</th>
              <th>Placement Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${assignedStudents.map(s => `
              <tr>
                <td><code style="font-size:0.85rem; font-weight:700; color:var(--primary);">${s.digitalSkillPassportId}</code></td>
                <td>
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <img src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:30px; height:30px; border-radius:50%; object-fit:cover;" />
                    <strong>${s.fullName}</strong>
                  </div>
                </td>
                <td style="font-size:0.85rem;">${s.course}</td>
                <td><span class="badge-pill badge-employed">${s.attendanceRate || '94%'}</span></td>
                <td><strong>${s.cgpa}</strong></td>
                <td>
                  <span class="badge-pill ${s.employmentStatus === 'employed' ? 'badge-employed' : 'warning'}">
                    ${s.employmentStatus === 'employed' ? 'Industry Placed' : 'Training Active'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="inspectStudentDossier(${s.id})"><i class="fa-solid fa-eye"></i> View Dossier</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Submissions & Announcements Row -->
    <div class="grid-2col-even">
      <!-- Cohort Submissions -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-file-signature text-purple"></i> Recent Student Submissions</h3>
          <button class="btn btn-sm btn-outline" onclick="navToFacultyView('grading')">View All &rarr;</button>
        </div>
        ${pendingSubs.length === 0 ? '<p class="text-muted" style="padding:1rem 0;">No submissions from assigned students yet.</p>' : `
          <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem;">
            ${pendingSubs.slice(0, 3).map(sub => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>${sub.studentName}</strong>
                  <span class="badge-pill ${sub.evaluationStatus === 'Graded' ? 'badge-employed' : 'warning'}">${sub.evaluationStatus}</span>
                </div>
                <p style="font-size:0.8rem; color:#64748b; margin:0.25rem 0;">${sub.assignmentTitle}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                  <span style="font-size:0.75rem; color:#94a3b8;"><i class="fa-solid fa-calendar"></i> ${sub.submissionDate}</span>
                  <button class="btn btn-sm btn-primary" onclick="openFacultyGradeModal(${sub.id})"><i class="fa-solid fa-pen-to-square"></i> Evaluate</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Cohort Announcements -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-bullhorn text-orange"></i> Cohort Announcements</h3>
          <button class="btn btn-sm btn-outline" onclick="promptFacultyAnnouncementModal()"><i class="fa-solid fa-plus"></i> New</button>
        </div>
        ${myAnnouncements.length === 0 ? '<p class="text-muted" style="padding:1rem 0;">No active announcements posted.</p>' : `
          <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem;">
            ${myAnnouncements.map(a => `
              <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:var(--radius-sm); padding:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:#92400e; font-size:0.85rem;">${a.title}</strong>
                  <span class="badge-pill warning" style="font-size:0.65rem;">${a.priority}</span>
                </div>
                <p style="font-size:0.8rem; color:#78350f; margin:0.25rem 0; line-height:1.4;">${a.content}</p>
                <span style="font-size:0.7rem; color:#b45309; display:block;"><i class="fa-solid fa-calendar-day"></i> ${a.date} &bull; ${a.targetGroup}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ================= 2. MY ASSIGNED STUDENTS ================= //
function renderFacultyStudents(container, f) {
  const assignedStudents = window.getFacultyAssignedStudents(f.facultyId);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Assigned Student Cohort (Cohort ${f.facultyId})</h2>
        <p>Monitor individual academic attendance, course progress, skills passport, and project submissions for students assigned to your guidance.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToFacultyView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Passport ID</th>
              <th>Student Dossier</th>
              <th>College & Branch</th>
              <th>Attendance</th>
              <th>CGPA</th>
              <th>Verified Skills</th>
              <th>Placement Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${assignedStudents.map(s => `
              <tr>
                <td><code style="font-size:0.85rem; font-weight:700; color:var(--primary);">${s.digitalSkillPassportId}</code></td>
                <td>
                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <img src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
                    <div>
                      <strong style="display:block;">${s.fullName}</strong>
                      <span style="font-size:0.75rem; color:#64748b;">${s.email}</span>
                    </div>
                  </div>
                </td>
                <td style="font-size:0.85rem;">
                  <strong>${s.college}</strong><br>
                  <span style="color:#64748b;">${s.course} (${s.yearSemester})</span>
                </td>
                <td>
                  <strong class="highlight-green">${s.attendanceRate || '94%'}</strong>
                </td>
                <td>
                  <strong class="highlight-purple">${s.cgpa}</strong>
                </td>
                <td>
                  <span class="badge-pill info">${(s.skills || []).length} Skills</span>
                </td>
                <td>
                  <span class="badge-pill ${s.employmentStatus === 'employed' ? 'badge-employed' : 'warning'}">
                    ${s.employmentStatus === 'employed' ? 'Industry Placed' : 'In Training'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="inspectStudentDossier(${s.id})"><i class="fa-solid fa-id-card"></i> View Full Dossier</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Inspect Student Dossier Modal (Shows only data of this specific student)
window.inspectStudentDossier = function(studentId) {
  const s = (window.SKT_STATE.students || []).find(st => st.id === Number(studentId));
  if (!s) return;

  const activeApps = (window.SKT_STATE.applications || []).filter(a => a.studentId === s.id);
  const mySubs = (window.SKT_STATE.courseSubmissions || []).filter(sub => sub.studentId === s.id);

  const html = `
    <div style="padding:0.5rem;">
      <div style="display:flex; gap:1.25rem; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:1rem; margin-bottom:1rem;">
        <img src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);" />
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <h3 style="margin:0; font-size:1.2rem;">${s.fullName}</h3>
            <span class="badge-pill badge-employed" style="font-family:monospace;">${s.digitalSkillPassportId}</span>
          </div>
          <p style="font-size:0.85rem; color:#64748b; margin:0.25rem 0 0;">
            ${s.course} &bull; ${s.college}
          </p>
          <p style="font-size:0.8rem; color:#475569; margin:0.15rem 0 0;">
            <i class="fa-solid fa-envelope"></i> ${s.email} &bull; <i class="fa-solid fa-phone"></i> ${s.phone}
          </p>
        </div>
      </div>

      <!-- Macro Indicators -->
      <div class="stat-cards-grid-4" style="margin-bottom:1rem;">
        <div class="dash-stat-card"><span class="stat-label">Attendance</span><strong class="stat-val highlight-green">${s.attendanceRate || '94%'}</strong></div>
        <div class="dash-stat-card"><span class="stat-label">CGPA</span><strong class="stat-val highlight-purple">${s.cgpa}</strong></div>
        <div class="dash-stat-card"><span class="stat-label">Verified Skills</span><strong class="stat-val highlight-blue">${(s.skills || []).length}</strong></div>
        <div class="dash-stat-card"><span class="stat-label">Applications</span><strong class="stat-val highlight-green">${activeApps.length}</strong></div>
      </div>

      <!-- Verified Skills List -->
      <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.4rem;"><i class="fa-solid fa-certificate"></i> Accredited Skills & Endorsements</h4>
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:1rem;">
        ${(s.skills || []).map(sk => `
          <span class="badge-pill badge-employed" style="font-size:0.75rem;">
            <i class="fa-solid fa-check-double"></i> ${typeof sk === 'string' ? sk : sk.name}
            ${sk.endorsedBy ? `<small style="display:block; font-size:0.65rem; opacity:0.8;">(${sk.endorsedBy})</small>` : ''}
          </span>
        `).join('')}
      </div>

      <!-- Submitted Projects -->
      <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.4rem;"><i class="fa-solid fa-laptop-code"></i> Submitted Projects & Deliverables</h4>
      ${mySubs.length === 0 ? '<p class="text-muted" style="font-size:0.85rem;">No submitted projects yet.</p>' : `
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
          ${mySubs.map(sub => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:0.6rem 0.8rem; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${sub.assignmentTitle}</strong>
                <span class="badge-pill ${sub.evaluationStatus === 'Graded' ? 'badge-employed' : 'warning'}">${sub.evaluationStatus} (${sub.marks || 0}/100)</span>
              </div>
              <p style="font-size:0.78rem; color:#64748b; margin:0.2rem 0;"><strong>Grade:</strong> ${sub.grade || 'Pending'} &bull; <strong>Evaluator:</strong> ${sub.evaluator || 'Pending Review'}</p>
              ${sub.feedback ? `<p style="font-size:0.78rem; color:#1e293b; margin:0.2rem 0;"><em>"${sub.feedback}"</em></p>` : ''}
              <div style="margin-top:0.4rem;">
                <button class="btn btn-sm btn-outline" onclick="previewSubmissionPdf('${sub.projectFileName}')"><i class="fa-solid fa-file-pdf text-red"></i> Preview PDF Deliverable</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Active Job Applications & Interviews -->
      <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.4rem;"><i class="fa-solid fa-briefcase"></i> Company Placement Status</h4>
      ${activeApps.length === 0 ? '<p class="text-muted" style="font-size:0.85rem;">No active applications.</p>' : `
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${activeApps.map(a => `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-sm); padding:0.6rem 0.8rem; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${a.jobTitle} &bull; ${a.companyName}</strong>
                <span class="badge-pill badge-employed">${a.status}</span>
              </div>
              ${a.interviewInfo ? `
                <p style="font-size:0.78rem; color:#166534; margin:0.25rem 0 0;">
                  <i class="fa-solid fa-video"></i> Interview: ${a.interviewInfo.date} at ${a.interviewInfo.time} (${a.interviewInfo.mode})
                </p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
  openSharedModal(`Student Dossier: ${s.fullName}`, html);
};

// ================= 3. SUBMISSIONS & GRADING DESK ================= //
function renderFacultySubmissions(container, f) {
  const assignedStudents = window.getFacultyAssignedStudents(f.facultyId);
  const assignedIds = assignedStudents.map(s => s.id);
  const cohortSubs = (window.SKT_STATE.courseSubmissions || []).filter(s => assignedIds.includes(s.studentId));

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Academic Submissions & Project Evaluation Desk</h2>
        <p>Review project source code, inspect uploaded PDF deliverables, grade assignments, and endorse technical competencies to student passports.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToFacultyView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Assignment Title</th>
              <th>Submission Date</th>
              <th>Project PDF Report</th>
              <th>Quiz Score</th>
              <th>Current Status</th>
              <th>Marks / Grade</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cohortSubs.length === 0 ? '<tr><td colspan="8" style="text-align:center; padding:2rem;">No submissions from assigned cohort yet.</td></tr>' : cohortSubs.map(sub => `
              <tr>
                <td>
                  <strong>${sub.studentName}</strong><br>
                  <code style="font-size:0.75rem; color:#64748b;">${sub.studentPassportId}</code>
                </td>
                <td style="font-size:0.85rem;">${sub.assignmentTitle}</td>
                <td style="font-size:0.8rem; color:#64748b;">${sub.submissionDate}</td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="previewSubmissionPdf('${sub.projectFileName}')" style="font-size:0.75rem;">
                    <i class="fa-solid fa-file-pdf text-red"></i> ${sub.projectFileName || 'Report.pdf'}
                  </button>
                </td>
                <td><strong class="highlight-green">${sub.quizScore || '100%'}</strong></td>
                <td>
                  <span class="badge-pill ${sub.evaluationStatus === 'Graded' ? 'badge-employed' : 'warning'}">
                    ${sub.evaluationStatus}
                  </span>
                </td>
                <td>
                  <strong>${sub.marks !== undefined ? sub.marks : '--'}/100</strong>
                  ${sub.grade ? `<span class="badge-pill info" style="font-size:0.7rem; margin-left:0.3rem;">${sub.grade}</span>` : ''}
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="openFacultyGradeModal(${sub.id})">
                    <i class="fa-solid fa-pen-to-square"></i> Evaluate & Grade
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openFacultyGradeModal = function(subId) {
  const sub = (window.SKT_STATE.courseSubmissions || []).find(s => s.id === Number(subId));
  if (!sub) return;

  const html = `
    <form onsubmit="handleFacultyGradeSubmit(event, ${sub.id})">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:0.75rem; margin-bottom:1rem; font-size:0.85rem;">
        <p style="margin:0 0 0.25rem;"><strong>Student:</strong> ${sub.studentName} (${sub.studentPassportId})</p>
        <p style="margin:0 0 0.25rem;"><strong>Assignment:</strong> ${sub.assignmentTitle}</p>
        <p style="margin:0 0 0.25rem;"><strong>Submitted Code / Query:</strong></p>
        <pre style="background:#0f172a; color:#38bdf8; padding:0.5rem; border-radius:4px; font-size:0.75rem; overflow-x:auto;">${sub.submissionText || 'No source provided'}</pre>
        ${sub.projectFileName ? `
          <div style="margin-top:0.4rem;">
            <button type="button" class="btn btn-sm btn-outline" onclick="previewSubmissionPdf('${sub.projectFileName}')"><i class="fa-solid fa-file-pdf text-red"></i> Preview Uploaded Project PDF (${sub.projectFileName})</button>
          </div>
        ` : ''}
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Numerical Marks (out of 100)</label>
          <input type="number" id="facMarks" min="0" max="100" value="${sub.marks || 95}" required />
        </div>
        <div class="form-group">
          <label>Letter Grade</label>
          <select id="facGrade" required>
            <option value="Grade A+" ${sub.grade === 'Grade A+' ? 'selected' : ''}>Grade A+ (Distinction)</option>
            <option value="Grade A" ${sub.grade === 'Grade A' ? 'selected' : ''}>Grade A (Excellent)</option>
            <option value="Grade B+" ${sub.grade === 'Grade B+' ? 'selected' : ''}>Grade B+ (Good)</option>
            <option value="Grade B" ${sub.grade === 'Grade B' ? 'selected' : ''}>Grade B (Satisfactory)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Technical Competency to Endorse on Student Passport</label>
        <input type="text" id="facSkillEndorse" value="${sub.skillEndorsed || 'Cloud Microservices & DevOps'}" required />
      </div>

      <div class="form-group">
        <label>Official Faculty Review Notes & Feedback</label>
        <textarea id="facFeedback" rows="3" required>${sub.feedback || 'Work meets high standards of academic rigor, clean architecture, and optimized execution.'}</textarea>
      </div>

      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:0.75rem;">
        <i class="fa-solid fa-stamp"></i> Publish Grade & Endorse Skill to Passport
      </button>
    </form>
  `;

  openSharedModal(`Evaluate Submission: ${sub.studentName}`, html);
};

window.handleFacultyGradeSubmit = function(e, subId) {
  e.preventDefault();
  const evalData = {
    marks: document.getElementById('facMarks').value,
    grade: document.getElementById('facGrade').value,
    skillEndorsed: document.getElementById('facSkillEndorse').value.trim(),
    feedback: document.getElementById('facFeedback').value.trim()
  };

  window.gradeFacultySubmission(subId, evalData);
  closeSharedModal();
  navToFacultyView('grading');
};

// ================= 4. ACADEMIC COURSES & LEARNING MATERIALS ================= //
function renderFacultyCourses(container, f) {
  const courses = window.SKT_STATE.courses || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Academic Course Materials & Lecture Modules</h2>
        <p>Curate lecture notes, video links, practical assignments, and assessment quizzes for students.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptFacultyCourseModal()"><i class="fa-solid fa-plus"></i> Add Learning Module</button>
    </div>

    <div class="grid-2col-even">
      ${courses.map(c => `
        <div class="card" style="border-top:4px solid var(--primary); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
              <div>
                <span class="badge-pill info" style="font-size:0.75rem;">${c.code}</span>
                <h3 style="font-size:1.15rem; font-weight:800; margin:0.35rem 0 0.2rem;">${c.title}</h3>
                <span style="font-size:0.8rem; color:#64748b;">${c.provider}</span>
              </div>
            </div>
            <p style="font-size:0.85rem; color:#475569; margin:0.5rem 0 0.75rem; line-height:1.5;">${c.overview}</p>
            
            <h4 style="font-size:0.8rem; text-transform:uppercase; color:#64748b; margin-bottom:0.4rem;">Syllabus Modules:</h4>
            <ul style="padding-left:1.2rem; font-size:0.825rem; color:#334155; margin-bottom:1rem;">
              ${(c.lessons || []).map(l => `<li><strong>${l.title}</strong> (${l.duration})</li>`).join('')}
            </ul>
          </div>

          <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.8rem; color:#64748b;"><i class="fa-solid fa-clock"></i> ${c.duration}</span>
            <button class="btn btn-sm btn-outline" onclick="alert('Module management synced with institute registry.');"><i class="fa-solid fa-pen"></i> Edit Syllabus</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptFacultyCourseModal() {
  const html = `
    <form onsubmit="handleFacultyCourseSubmit(event)">
      <div class="form-group">
        <label>Course / Module Title</label>
        <input type="text" id="fcTitle" placeholder="e.g. Distributed Database Engineering" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Course Code</label>
          <input type="text" id="fcCode" placeholder="e.g. CS-DB-302" required />
        </div>
        <div class="form-group">
          <label>Duration</label>
          <input type="text" id="fcDuration" placeholder="e.g. 6 Weeks" required />
        </div>
      </div>
      <div class="form-group">
        <label>Course Overview & Objectives</label>
        <textarea id="fcOverview" rows="2" placeholder="Describe the topics covered and technical skills gained..." required></textarea>
      </div>
      <div class="form-group">
        <label>Key Skills Imparted (comma-separated)</label>
        <input type="text" id="fcSkills" placeholder="e.g. SQL, NoSQL, Sharding, Replication" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Publish Academic Module</button>
    </form>
  `;
  openSharedModal("Publish Academic Course Module", html);
}

function handleFacultyCourseSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('fcTitle').value.trim();
  const code = document.getElementById('fcCode').value.trim();
  const duration = document.getElementById('fcDuration').value.trim();
  const overview = document.getElementById('fcOverview').value.trim();
  const skills = document.getElementById('fcSkills').value.split(',').map(s => s.trim());

  const f = window.getLoggedInFaculty();
  const newCourse = {
    id: `course-${Date.now()}`,
    code,
    title,
    category: "Academic",
    provider: f.department,
    instructor: f.name,
    instructorRole: f.designation,
    duration,
    level: "Degree / Diploma",
    requiredSkills: [],
    skillsTaught: skills,
    overview,
    enrolled: true,
    progressPercent: 0,
    lessons: [
      { id: 1, title: "Foundations & Architectural Principles", duration: "40 min", completed: false, content: "Core lecture notes and theoretical grounding." }
    ],
    assignment: {
      id: `asg-${Date.now()}`,
      title: `${title} Capstone Project`,
      prompt: "Implement production architecture and submit code and project PDF.",
      deadline: "End of Week 4",
      maxMarks: 100,
      submitted: false
    }
  };

  if (!window.SKT_STATE.courses) window.SKT_STATE.courses = [];
  window.SKT_STATE.courses.unshift(newCourse);
  window.saveLocalSktState();
  closeSharedModal();
  showToast("New academic course module published!", "success");
  navToFacultyView('courses');
}

// ================= 5. ASSIGNMENTS & TASKS ================= //
function renderFacultyAssignments(container, f) {
  const courses = window.SKT_STATE.courses || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Assignments & Academic Deliverables</h2>
        <p>Define tasks, hands-on prompts, submission deadlines, and maximum marks for student cohorts.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptFacultyAssignmentModal()"><i class="fa-solid fa-plus"></i> Create Assignment</button>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Assignment Title</th>
              <th>Prompt / Instructions</th>
              <th>Deadline</th>
              <th>Max Marks</th>
              <th>Submissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${courses.filter(c => c.assignment).map(c => {
              const asg = c.assignment;
              const subCount = (window.SKT_STATE.courseSubmissions || []).filter(s => s.courseId === c.id).length;
              return `
                <tr>
                  <td><strong>${c.title}</strong><br><code style="font-size:0.75rem;">${c.code}</code></td>
                  <td><strong>${asg.title}</strong></td>
                  <td style="font-size:0.85rem; max-width:280px; color:#475569;">${asg.prompt}</td>
                  <td><span class="badge-pill warning">${asg.deadline}</span></td>
                  <td><strong>${asg.maxMarks} Marks</strong></td>
                  <td><span class="badge-pill info">${subCount} Submissions</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="navToFacultyView('grading')"><i class="fa-solid fa-eye"></i> View Work</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function promptFacultyAssignmentModal() {
  const html = `
    <form onsubmit="handleFacultyAssignmentSubmit(event)">
      <div class="form-group">
        <label>Select Course</label>
        <select id="faCourseId">
          ${(window.SKT_STATE.courses || []).map(c => `<option value="${c.id}">${c.title} (${c.code})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Assignment Title</label>
        <input type="text" id="faTitle" placeholder="e.g. Distributed Consensus Engine Implementation" required />
      </div>
      <div class="form-group">
        <label>Task Prompt & Technical Specifications</label>
        <textarea id="faPrompt" rows="3" placeholder="Specify code requirements, deliverable format (PDF/Repo), and evaluation criteria..." required></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Submission Deadline</label>
          <input type="text" id="faDeadline" placeholder="e.g. Friday, March 20" required />
        </div>
        <div class="form-group">
          <label>Maximum Marks</label>
          <input type="number" id="faMarks" value="100" min="10" max="100" required />
        </div>
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-bullhorn"></i> Post Assignment to Students</button>
    </form>
  `;
  openSharedModal("Create Academic Assignment", html);
}

function handleFacultyAssignmentSubmit(e) {
  e.preventDefault();
  const cId = document.getElementById('faCourseId').value;
  const course = (window.SKT_STATE.courses || []).find(c => c.id === cId);
  if (course) {
    course.assignment = {
      id: `asg-${Date.now()}`,
      title: document.getElementById('faTitle').value.trim(),
      prompt: document.getElementById('faPrompt').value.trim(),
      deadline: document.getElementById('faDeadline').value.trim(),
      maxMarks: Number(document.getElementById('faMarks').value) || 100,
      submitted: false
    };
    window.saveLocalSktState();
    closeSharedModal();
    showToast("Academic assignment posted successfully!", "success");
    navToFacultyView('assignments');
  }
}

// ================= 6. QUIZZES & ASSESSMENTS ================= //
function renderFacultyQuizzes(container, f) {
  const courses = window.SKT_STATE.courses || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Quizzes & Competency Assessments</h2>
        <p>Design multi-choice assessments (MCQ) with automated grading and skill issuance thresholds.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptFacultyQuizModal()"><i class="fa-solid fa-plus"></i> Build New Quiz</button>
    </div>

    <div class="grid-2col-even">
      ${courses.filter(c => c.quiz).map(c => `
        <div class="card" style="border-left:4px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
            <div>
              <span class="badge-pill info" style="font-size:0.75rem;">${c.code}</span>
              <h3 style="font-size:1.15rem; font-weight:800; margin-top:0.3rem;">${c.quiz.title}</h3>
            </div>
            <span class="badge-pill badge-employed">${(c.quiz.questions || []).length} MCQs</span>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:0.75rem; margin:0.75rem 0;">
            <strong style="font-size:0.8rem; color:#475569; display:block; margin-bottom:0.35rem;">Sample Question:</strong>
            <p style="font-size:0.85rem; margin:0; font-weight:600;">"${c.quiz.questions[0] ? c.quiz.questions[0].q : 'Assessment question'}"</p>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:0.75rem;">
            <span style="font-size:0.8rem; color:#64748b;">Passing Score: 66%</span>
            <button class="btn btn-sm btn-outline" onclick="alert('Quiz preview loaded in editor.');"><i class="fa-solid fa-pen"></i> Edit Questions</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptFacultyQuizModal() {
  const html = `
    <form onsubmit="handleFacultyQuizSubmit(event)">
      <div class="form-group">
        <label>Course</label>
        <select id="fqCourseId">
          ${(window.SKT_STATE.courses || []).map(c => `<option value="${c.id}">${c.title} (${c.code})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Quiz Title</label>
        <input type="text" id="fqTitle" placeholder="e.g. Distributed Systems Mid-Term Quiz" required />
      </div>

      <div style="background:#f8fafc; padding:0.75rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; margin-bottom:1rem;">
        <h4 style="font-size:0.85rem; margin-bottom:0.4rem;"><i class="fa-solid fa-question-circle text-primary"></i> Question 1</h4>
        <div class="form-group">
          <label>Question Prompt</label>
          <input type="text" id="fqQ1" placeholder="e.g. In the CAP theorem, what does 'A' represent?" required />
        </div>
        <div class="form-row">
          <div class="form-group"><label>Option A</label><input type="text" id="fqOptA" placeholder="Availability" required /></div>
          <div class="form-group"><label>Option B</label><input type="text" id="fqOptB" placeholder="Atomicity" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Option C</label><input type="text" id="fqOptC" placeholder="Authentication" required /></div>
          <div class="form-group"><label>Option D</label><input type="text" id="fqOptD" placeholder="Asynchrony" required /></div>
        </div>
        <div class="form-group">
          <label>Correct Option</label>
          <select id="fqCorrect">
            <option value="0">Option A</option>
            <option value="1">Option B</option>
            <option value="2">Option C</option>
            <option value="3">Option D</option>
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fa-solid fa-cloud-arrow-up"></i> Save & Publish Assessment</button>
    </form>
  `;
  openSharedModal("Build MCQ Competency Assessment", html);
}

function handleFacultyQuizSubmit(e) {
  e.preventDefault();
  const cId = document.getElementById('fqCourseId').value;
  const course = (window.SKT_STATE.courses || []).find(c => c.id === cId);
  if (course) {
    course.quiz = {
      id: `quiz-${Date.now()}`,
      title: document.getElementById('fqTitle').value.trim(),
      passed: false,
      score: null,
      questions: [
        {
          q: document.getElementById('fqQ1').value.trim(),
          options: [
            document.getElementById('fqOptA').value.trim(),
            document.getElementById('fqOptB').value.trim(),
            document.getElementById('fqOptC').value.trim(),
            document.getElementById('fqOptD').value.trim()
          ],
          correct: Number(document.getElementById('fqCorrect').value)
        }
      ]
    };
    window.saveLocalSktState();
    closeSharedModal();
    showToast("MCQ Assessment published to course!", "success");
    navToFacultyView('quizzes');
  }
}

// ================= 7. ANNOUNCEMENTS & NOTICES ================= //
function renderFacultyAnnouncements(container, f) {
  const announcements = (window.SKT_STATE.facultyAnnouncements || []).filter(a => a.facultyId === f.facultyId);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Cohort Announcements & Urgent Notices</h2>
        <p>Broadcast alerts, submission deadlines, and interview preparatory guidelines to your assigned students.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptFacultyAnnouncementModal()"><i class="fa-solid fa-plus"></i> Broadcast Notice</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:1rem; max-width:800px;">
      ${announcements.length === 0 ? '<div class="card"><p class="text-muted">No notices broadcasted yet.</p></div>' : announcements.map(a => `
        <div class="card" style="border-left:4px solid ${a.priority === 'Urgent' ? '#ef4444' : (a.priority === 'Placement' ? '#2563eb' : '#f59e0b')};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="badge-pill ${a.priority === 'Urgent' ? 'badge-unemployed' : (a.priority === 'Placement' ? 'badge-employed' : 'warning')}">${a.priority}</span>
              <h3 style="font-size:1.1rem; font-weight:800; margin:0;">${a.title}</h3>
            </div>
            <span style="font-size:0.75rem; color:#94a3b8;"><i class="fa-solid fa-calendar-day"></i> ${a.date}</span>
          </div>
          <p style="font-size:0.9rem; color:#334155; line-height:1.6; margin:0.5rem 0;">${a.content}</p>
          <div style="font-size:0.75rem; color:#64748b; border-top:1px solid #f1f5f9; padding-top:0.5rem;">
            <strong>Target:</strong> ${a.targetGroup} &bull; <strong>Author:</strong> ${a.facultyName}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

window.promptFacultyAnnouncementModal = function() {
  const f = window.getLoggedInFaculty();
  const html = `
    <form onsubmit="handleFacultyAnnouncementSubmit(event)">
      <div class="form-group">
        <label>Notice Title</label>
        <input type="text" id="fanTitle" placeholder="e.g. Mandatory System Design Mock Interview" required />
      </div>
      <div class="form-group">
        <label>Priority Tag</label>
        <select id="fanPriority">
          <option value="Academic">Academic (General Coursework)</option>
          <option value="Urgent">Urgent (Submission Deadline)</option>
          <option value="Placement">Placement (Company Interview Round)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Target Student Group</label>
        <input type="text" id="fanTarget" value="Cohort ${f.facultyId} (${f.department})" required />
      </div>
      <div class="form-group">
        <label>Notice Message & Instructions</label>
        <textarea id="fanContent" rows="4" placeholder="Write full details and action items for assigned students..." required></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-paper-plane"></i> Broadcast Notice to Students</button>
    </form>
  `;
  openSharedModal("Broadcast Cohort Announcement", html);
};

window.handleFacultyAnnouncementSubmit = function(e) {
  e.preventDefault();
  const f = window.getLoggedInFaculty();
  const annData = {
    title: document.getElementById('fanTitle').value.trim(),
    priority: document.getElementById('fanPriority').value,
    targetGroup: document.getElementById('fanTarget').value.trim(),
    content: document.getElementById('fanContent').value.trim()
  };
  window.postFacultyAnnouncement(f.facultyId, annData);
  closeSharedModal();
  navToFacultyView('announcements');
};

// ================= 8. FACULTY PROFILE SETTINGS ================= //
function renderFacultyProfile(container, f) {
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Faculty Profile Settings</h2>
        <p>Manage designation, office location, consultation hours, and academic credentials.</p>
      </div>
    </div>

    <div class="card" style="max-width:760px;">
      <form onsubmit="saveFacultyProfileSettings(event)">
        <div style="display:flex; align-items:center; gap:1.25rem; border-bottom:1px solid #e2e8f0; padding-bottom:1.25rem; margin-bottom:1.25rem;">
          <img src="${f.avatarUrl}" onerror="handleAvatarError(this)" style="width:75px; height:75px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);" />
          <div>
            <h4 style="margin:0 0 0.2rem;">${f.name}</h4>
            <span class="badge-pill badge-employed" style="font-family:monospace;">${f.facultyId}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input type="text" id="facName" value="${f.name}" required /></div>
          <div class="form-group"><label>Official Email</label><input type="email" id="facEmail" value="${f.email}" required /></div>
        </div>

        <div class="form-row">
          <div class="form-group"><label>Department</label><input type="text" id="facDept" value="${f.department}" required /></div>
          <div class="form-group"><label>Designation</label><input type="text" id="facDesig" value="${f.designation}" required /></div>
        </div>

        <div class="form-group">
          <label>Campus Office / Cabin Location</label>
          <input type="text" id="facOffice" value="${f.office || 'Dept. of Computer Science, Lab 402'}" required />
        </div>

        <div class="form-row">
          <div class="form-group"><label>Consultation / Office Hours</label><input type="text" id="facHours" value="${f.officeHours || 'Mon-Thu 2:00 PM - 5:00 PM'}" required /></div>
          <div class="form-group"><label>Phone Number</label><input type="tel" id="facPhone" value="${f.phone || '+91 98220 12345'}" required /></div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-floppy-disk"></i> Save Faculty Settings</button>
      </form>
    </div>
  `;
}

window.saveFacultyProfileSettings = function(e) {
  e.preventDefault();
  const f = window.getLoggedInFaculty();
  f.name = document.getElementById('facName').value.trim();
  f.email = document.getElementById('facEmail').value.trim();
  f.department = document.getElementById('facDept').value.trim();
  f.designation = document.getElementById('facDesig').value.trim();
  f.office = document.getElementById('facOffice').value.trim();
  f.officeHours = document.getElementById('facHours').value.trim();
  f.phone = document.getElementById('facPhone').value.trim();

  window.saveLocalSktState();
  showToast("Faculty profile updated successfully!", "success");
  navToFacultyView('profile');
};
