// student.js - Student Portal with Unified Skill Search, Interactive Courses/Quizzes & Real-Time Application Tracker
let currentSearchSkill = "Data Analytics";

function navToStudentView(subView, optParam) {
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-student');
  if (screen) screen.style.display = 'grid';

  document.querySelectorAll('#screen-student .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-student-${subView}`);
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

  const container = document.getElementById('studentContentArea');
  if (!container) return;

  const s = window.getLoggedInStudent ? window.getLoggedInStudent() : window.SKT_STATE.student;

  switch (subView) {
    case 'dashboard': renderStudentDashboard(container, s); break;
    case 'search': renderSkillSearchEngine(container, s, optParam || currentSearchSkill); break;
    case 'careerpaths': renderStudentCareerPaths(container, s); break;
    case 'courses': renderInteractiveCourses(container, s, optParam); break;
    case 'applications': renderStudentApplicationsTracker(container, s); break;
    case 'passport': renderDigitalSkillPassport(container, s); break;
    case 'jobmatching': renderJobMatchingSystem(container, s); break;
    case 'skillgap': renderSkillGapRecommendations(container, s); break;
    case 'employment': renderEmploymentTracking(container, s); break;
    case 'followups': renderAutomaticFollowups(container, s); break;
    case 'profile': renderStudentProfileSettings(container, s); break;
    case 'industry': renderStudentIndustryOpportunities(container, s); break;
    case 'employees': renderStudentEmployeeMentors(container, s); break;
    case 'skills': renderStudentSkills(container, s); break;
    case 'training': renderStudentTraining(container, s); break;
    case 'certificates': renderStudentCertificates(container, s); break;
    case 'projects': renderStudentProjects(container, s); break;
    case 'learningplan': renderStudentLearningPlan(container, s); break;
    default: renderStudentDashboard(container, s);
  }

  window.location.hash = `student/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToStudentView = navToStudentView;

// ================= 1B. COMPANY CAREER PATHS & TRAJECTORIES ================= //
function renderStudentCareerPaths(container, s) {
  const paths = window.SKT_STATE.careerPaths || [];

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Company Career Paths & Industry Ladders</h2>
        <p>Explore structured career trajectories provided by accredited enterprises, view salary benchmarks, and enroll in company training courses.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToStudentView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="grid-2col-even">
      ${paths.map(p => {
        const comp = (window.SKT_STATE.companies || []).find(c => c.id === p.companyId) || {};
        return `
          <div class="card" style="border-top:4px solid var(--primary); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <img src="${comp.logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}" onerror="handleAvatarError(this)" style="width:32px; height:32px; border-radius:4px; object-fit:cover;" />
                  <strong style="font-size:0.85rem; color:#475569;">${p.companyName}</strong>
                </div>
                <strong class="highlight-green" style="font-size:0.95rem;">${p.startingSalary}</strong>
              </div>

              <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.35rem;">${p.title}</h3>
              <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem; line-height:1.5;">${p.description}</p>
              
              <div style="margin-bottom:0.75rem;">
                <strong style="font-size:0.75rem; text-transform:uppercase; color:#64748b; display:block; margin-bottom:0.35rem;">Required Skills:</strong>
                ${(p.requiredSkills || []).map(sk => {
                  const has = (s.skills || []).some(sks => (typeof sks === 'string' ? sks : sks.name).toLowerCase() === sk.toLowerCase());
                  return `
                    <span class="badge-pill ${has ? 'badge-employed' : 'warning'}" style="margin-right:0.25rem; font-size:0.75rem;">
                      <i class="fa-solid ${has ? 'fa-check' : 'fa-circle-dot'}"></i> ${sk}
                    </span>
                  `;
                }).join('')}
              </div>

              <div style="margin-bottom:1rem;">
                <strong style="font-size:0.75rem; text-transform:uppercase; color:#64748b; display:block; margin-bottom:0.35rem;">Skills Taught by Company:</strong>
                ${(p.skillsImparted || []).map(sk => `<span class="badge-pill info" style="margin-right:0.25rem; font-size:0.75rem;">${sk}</span>`).join('')}
              </div>
            </div>

            <div style="border-top:1px solid #e2e8f0; padding-top:0.75rem; display:flex; gap:0.5rem;">
              <button class="btn btn-sm btn-primary" style="flex:1;" onclick="navToStudentView('courses', '${p.recommendedCourseId || 'data-analytics'}')">
                <i class="fa-solid fa-graduation-cap"></i> Company Course
              </button>
              <button class="btn btn-sm btn-outline" onclick="navToStudentView('search', '${(p.requiredSkills && p.requiredSkills[0]) || 'Data Analytics'}')">
                <i class="fa-solid fa-briefcase"></i> View Jobs
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ================= 1. SKILL SEARCH ENGINE (Data Analytics, AWS Cloud, etc.) ================= //
function renderSkillSearchEngine(container, s, query = "Data Analytics") {
  currentSearchSkill = query;
  const q = query.toLowerCase().trim();

  // Find related skills, companies, jobs, courses, and mentors
  const allCourses = window.SKT_STATE.courses || [];
  const allJobs = (window.SKT_STATE.industry && window.SKT_STATE.industry.jobs) ? window.SKT_STATE.industry.jobs : [];
  const allCompanies = window.SKT_STATE.industryDirectoryForStudents || [];
  const allMentors = window.SKT_STATE.employeeMentorsForStudents || [];

  const matchedCourses = allCourses.filter(c => 
    c.title.toLowerCase().includes(q) || 
    c.category.toLowerCase().includes(q) || 
    c.skillsTaught.some(sk => sk.toLowerCase().includes(q))
  );

  const matchedJobs = allJobs.filter(j => 
    j.title.toLowerCase().includes(q) || 
    j.requiredSkills.some(sk => sk.toLowerCase().includes(q))
  );

  const matchedCompanies = allCompanies.filter(c => 
    c.topHiringSkills.some(sk => sk.toLowerCase().includes(q)) || 
    c.sector.toLowerCase().includes(q)
  );

  const matchedMentors = allMentors.filter(m => 
    m.topics.toLowerCase().includes(q) || 
    m.designation.toLowerCase().includes(q)
  );

  // Derive required and prerequisite skills for this domain
  let requiredSkillsList = [];
  if (q.includes("data") || q.includes("analytics")) {
    requiredSkillsList = ["Excel", "SQL", "Power BI", "Data Analytics", "Statistics", "Communication"];
  } else if (q.includes("cloud") || q.includes("aws")) {
    requiredSkillsList = ["AWS Cloud", "Docker", "Linux", "Node.js", "CI/CD", "ECS"];
  } else {
    requiredSkillsList = ["JavaScript", "Node.js", "React", "MySQL", "REST APIs", "Git"];
  }

  container.innerHTML = `
    <!-- Top Search Bar -->
    <div class="card" style="background: linear-gradient(135deg, #0b1528 0%, #1e3a8a 100%); color: #ffffff; border: none; margin-bottom: 1.5rem; padding: 2rem;">
      <span class="badge-pill info" style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.75rem; margin-bottom:0.5rem;"><i class="fa-solid fa-magnifying-glass"></i> SKILLTRACK UNIFIED SEARCH ENGINE</span>
      <h2 style="font-size:1.8rem; font-weight:800; color:#ffffff; margin-bottom:0.4rem;">Search Skills, Jobs, Courses & Mentors</h2>
      <p style="color:#cbd5e1; font-size:0.9rem; margin-bottom:1.25rem;">
        Discover industry skill requirements, hiring enterprises, accredited mentor courses, and interactive certification quizzes.
      </p>

      <form onsubmit="handleSkillSearchSubmit(event)" style="display:flex; gap:0.5rem; max-width:700px;">
        <div style="position:relative; flex:1;">
          <input type="text" id="skillSearchInput" value="${query}" placeholder="Search a skill (e.g. Data Analytics, AWS Cloud, Full Stack)..." style="width:100%; padding:0.85rem 1rem 0.85rem 2.75rem; border-radius:var(--radius-sm); border:none; font-size:0.95rem; background:#ffffff; color:#0f172a;" />
          <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); color:#64748b;"></i>
        </div>
        <button type="submit" class="btn btn-primary" style="background:#2563eb; border-color:#2563eb; padding:0.85rem 1.5rem; font-weight:700;"><i class="fa-solid fa-search"></i> Search</button>
      </form>

      <!-- Quick Preset Filter Buttons -->
      <div style="display:flex; align-items:center; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">
        <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;">Popular Skills:</span>
        <button type="button" class="btn btn-sm btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.1);" onclick="navToStudentView('search', 'Data Analytics')"><i class="fa-solid fa-chart-line"></i> Data Analytics</button>
        <button type="button" class="btn btn-sm btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.1);" onclick="navToStudentView('search', 'AWS Cloud')"><i class="fa-solid fa-cloud"></i> AWS Cloud</button>
        <button type="button" class="btn btn-sm btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.1);" onclick="navToStudentView('search', 'Full Stack')"><i class="fa-solid fa-code"></i> Full Stack</button>
        <button type="button" class="btn btn-sm btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.1);" onclick="navToStudentView('search', 'SQL')"><i class="fa-solid fa-database"></i> SQL</button>
        <button type="button" class="btn btn-sm btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.1);" onclick="navToStudentView('search', 'Python')"><i class="fa-brands fa-python"></i> Python</button>
      </div>
    </div>

    <!-- Search Results Section -->
    <div class="welcome-row">
      <div>
        <h2>Results for: <span class="highlight-blue">${query}</span></h2>
        <p>Connected ecosystem elements matching this skill domain.</p>
      </div>
    </div>

    <!-- 1. Required Skills Matrix -->
    <div class="card" style="margin-bottom:1.5rem; border-left:4px solid var(--primary);">
      <div class="card-head space-between">
        <h3><i class="fa-solid fa-list-check text-primary"></i> 1. Required & Prerequisite Skills for ${query}</h3>
        <span class="badge-pill info">Curriculum & Industry Standard</span>
      </div>
      <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
        Competencies evaluated by industrial employers when interviewing for ${query} positions:
      </p>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        ${requiredSkillsList.map(sk => {
          const has = (s.skills || []).some(sks => (typeof sks === 'string' ? sks : sks.name).toLowerCase() === sk.toLowerCase());
          return `
            <span class="badge-pill ${has ? 'badge-employed' : 'warning'}" style="font-size:0.8rem; padding:0.35rem 0.75rem;">
              <i class="fa-solid ${has ? 'fa-check' : 'fa-plus'}"></i> ${sk} ${has ? '(Acquired)' : '(To Learn)'}
            </span>
          `;
        }).join('')}
      </div>
    </div>

    <!-- 2. Hiring Companies & 3. Matching Jobs -->
    <div class="grid-2col-even" style="margin-bottom:1.5rem;">
      <!-- Companies -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-building text-primary"></i> 2. Hiring Companies (${matchedCompanies.length})</h3>
          <span class="badge-pill badge-employed">Verified Partners</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${matchedCompanies.map(c => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:#f8fafc; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <img src="${c.logo}" onerror="handleAvatarError(this)" style="width:40px; height:40px; border-radius:var(--radius-sm); object-fit:cover;" />
                <div>
                  <strong style="font-size:0.95rem; display:block;">${c.name}</strong>
                  <span class="text-muted" style="font-size:0.75rem;"><i class="fa-solid fa-location-dot"></i> ${c.district} &bull; ${c.openingsCount} Openings</span>
                </div>
              </div>
              <span class="badge-pill badge-employed" style="font-size:0.7rem;">${c.trustScore}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Matching Jobs -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-briefcase text-green"></i> 3. Matching Job Openings (${matchedJobs.length})</h3>
          <button class="btn btn-sm btn-outline" onclick="navToStudentView('jobmatching')">View All &rarr;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${matchedJobs.map(j => {
            const hasApplied = (window.SKT_STATE.applications || []).some(a => a.jobId === j.id && a.studentId === s.id);
            return `
              <div style="padding:0.75rem; background:#f8fafc; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <strong style="font-size:0.95rem;">${j.title}</strong>
                    <span class="text-muted" style="display:block; font-size:0.75rem;">Tech Solutions &bull; ${j.district} &bull; <strong class="highlight-green">${j.salaryRange}</strong></span>
                  </div>
                  <div>
                    ${hasApplied ? `
                      <button class="btn btn-sm btn-outline" onclick="navToStudentView('applications')" style="color:#10b981; border-color:#10b981;"><i class="fa-solid fa-circle-check"></i> Applied</button>
                    ` : `
                      <button class="btn btn-sm btn-primary" onclick="window.applyForJob(${j.id})"><i class="fa-solid fa-paper-plane"></i> 1-Click Apply</button>
                    `}
                  </div>
                </div>
                <div style="margin-top:0.4rem;">
                  ${(j.requiredSkills || []).map(r => `<span class="badge-pill info" style="font-size:0.65rem; margin-right:0.2rem;">${r}</span>`).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- 4. Interactive Courses & Mentor Lessons & 5. Mentors -->
    <div class="grid-2col-even">
      <!-- Courses & Quizzes -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-graduation-cap text-primary"></i> 4. Accredited Courses & Quizzes</h3>
          <span class="badge-pill info">State Subsidized</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${matchedCourses.map(c => `
            <div style="padding:1rem; border:1px solid #e2e8f0; border-radius:var(--radius-sm); background:#ffffff;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h4 style="font-size:1rem; margin-bottom:0.2rem;">${c.title}</h4>
                  <p class="text-muted" style="font-size:0.8rem;"><i class="fa-solid fa-chalkboard-user"></i> Mentor: <strong>${c.instructor}</strong> &bull; ${c.duration}</p>
                </div>
                <span class="badge-pill ${c.progressPercent === 100 ? 'badge-employed' : 'info'}">${c.progressPercent}% Completed</span>
              </div>
              <p style="font-size:0.85rem; color:#475569; margin:0.5rem 0;">${c.overview}</p>
              <div style="display:flex; gap:0.4rem; margin-top:0.75rem; flex-wrap:wrap;">
                <button class="btn btn-sm btn-primary" onclick="navToStudentView('courses', '${c.id}')"><i class="fa-solid fa-play"></i> Open Lessons & Assignment</button>
                <button class="btn btn-sm btn-outline" onclick="navToStudentView('courses', '${c.id}')"><i class="fa-solid fa-brain"></i> Take Certification Quiz</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Industry Mentors -->
      <div class="card">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-user-tie text-primary"></i> 5. Industry Mentors (${matchedMentors.length})</h3>
          <span class="badge-pill badge-employed">1-on-1 Guidance</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${matchedMentors.map(m => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:#f8fafc; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <img src="${m.avatar}" onerror="handleAvatarError(this)" style="width:45px; height:45px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);" />
                <div>
                  <strong style="font-size:0.95rem; display:block;">${m.name}</strong>
                  <span style="font-size:0.75rem; color:var(--primary); font-weight:600;">${m.designation}</span>
                  <span class="text-muted" style="font-size:0.75rem; display:block;">${m.company} &bull; ${m.topics}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="showToast('Mentorship session request sent to ${m.name}!', 'success')">Book Mentor</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function handleSkillSearchSubmit(e) {
  e.preventDefault();
  const query = document.getElementById('skillSearchInput').value.trim();
  if (query) {
    navToStudentView('search', query);
  }
}

// ================= 2. INTERACTIVE COURSES, LESSONS, ASSIGNMENTS & QUIZZES ================= //
function renderInteractiveCourses(container, s, selectedCourseId = "data-analytics") {
  const courses = window.SKT_STATE.courses || [];
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Accredited Course Learning & Skill Mastery</h2>
        <p>Learn through mentor video/text lessons, complete hands-on assignments, and earn verified credentials via quizzes.</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-outline btn-sm" onclick="navToStudentView('search', '${currentCourse.category}')"><i class="fa-solid fa-magnifying-glass"></i> Explore More Courses</button>
      </div>
    </div>

    <!-- Course Selector Tabs -->
    <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem; flex-wrap:wrap;">
      ${courses.map(c => `
        <button class="btn btn-sm ${c.id === currentCourse.id ? 'btn-primary' : 'btn-outline'}" onclick="navToStudentView('courses', '${c.id}')">
          <i class="fa-solid fa-book-open"></i> ${c.title.split('&')[0]} (${c.progressPercent}%)
        </button>
      `).join('')}
    </div>

    <!-- Course Hero Card -->
    <div class="card" style="margin-bottom:1.5rem; border-top:4px solid var(--primary);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="badge-pill info" style="margin-bottom:0.35rem;">CODE: ${currentCourse.code} &bull; ${currentCourse.category.toUpperCase()}</span>
          <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:0.25rem;">${currentCourse.title}</h2>
          <p class="text-muted" style="font-size:0.85rem;">
            <i class="fa-solid fa-chalkboard-user"></i> Lead Instructor: <strong>${currentCourse.instructor}</strong> (${currentCourse.instructorRole}) &bull; Provider: <strong>${currentCourse.provider}</strong>
          </p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.8rem; font-weight:700; color:#64748b;">Course Progress</div>
          <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">${currentCourse.progressPercent}%</div>
        </div>
      </div>
    </div>

    <!-- 3-Way Course Player Tabs (Mentor Lessons, Assignment, Certification Quiz) -->
    <div class="card">
      <div style="display:flex; border-bottom:1px solid #e2e8f0; margin-bottom:1.25rem; gap:1rem;">
        <button class="auth-tab-btn active" id="cTabLessons" onclick="switchCoursePlayerTab('lessons')"><i class="fa-solid fa-chalkboard"></i> Mentor Lessons (3)</button>
        <button class="auth-tab-btn" id="cTabAssignment" onclick="switchCoursePlayerTab('assignment')"><i class="fa-solid fa-file-pen"></i> Hands-on Assignment</button>
        <button class="auth-tab-btn" id="cTabQuiz" onclick="switchCoursePlayerTab('quiz')"><i class="fa-solid fa-brain"></i> Certification Quiz</button>
      </div>

      <!-- Tab 1: Mentor Lessons -->
      <div id="cContentLessons">
        <h4 style="margin-bottom:0.75rem; color:var(--primary);"><i class="fa-solid fa-video"></i> Video & Text Mentor Modules</h4>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${(currentCourse.lessons || []).map((les, idx) => `
            <div style="padding:1rem; border:1px solid #e2e8f0; border-radius:var(--radius-sm); background:${les.completed ? '#f0fdf4' : '#ffffff'};">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="font-size:0.95rem;">Lesson ${idx + 1}: ${les.title}</h4>
                <span class="badge-pill ${les.completed ? 'badge-employed' : 'info'}">${les.completed ? 'Completed' : les.duration}</span>
              </div>
              <p style="font-size:0.85rem; color:#475569; margin:0.5rem 0; line-height:1.5;">${les.content}</p>
              <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                <button class="btn btn-sm btn-outline" onclick="showToast('Playing module video: ${les.title}', 'info')"><i class="fa-solid fa-circle-play"></i> Watch Lesson</button>
                <button class="btn btn-sm btn-primary" onclick="markLessonComplete('${currentCourse.id}', ${les.id})"><i class="fa-solid fa-check"></i> Mark Complete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab 2: Assignment & Project Deliverable -->
      <div id="cContentAssignment" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <h4 style="color:var(--primary); margin-bottom:0.25rem;"><i class="fa-solid fa-laptop-code"></i> Practical Project Deliverable</h4>
            <p class="text-muted" style="font-size:0.8rem;">Reviewed directly by company mentors for hiring consideration & skill endorsement.</p>
          </div>
          <span class="badge-pill info">Company Assessment</span>
        </div>

        <div style="padding:1.25rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); margin-bottom:1.25rem;">
          <h3 style="font-size:1.1rem; margin-bottom:0.35rem;">${currentCourse.assignment.title}</h3>
          <p style="font-size:0.9rem; color:#334155; line-height:1.6; margin-bottom:1rem;">${currentCourse.assignment.prompt}</p>

          ${(() => {
            const sub = (window.SKT_STATE.courseSubmissions || []).find(s => s.courseId === currentCourse.id && s.studentId === window.SKT_STATE.student.id);
            if (sub) {
              return `
                <div style="padding:1rem; background:#ffffff; border:1px solid #e2e8f0; border-radius:var(--radius-sm);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                    <span class="badge-pill ${sub.evaluationStatus === 'Graded' ? 'badge-employed' : 'warning'}" style="font-size:0.85rem;">
                      <i class="fa-solid ${sub.evaluationStatus === 'Graded' ? 'fa-circle-check' : 'fa-clock'}"></i> ${sub.evaluationStatus === 'Graded' ? `${sub.grade} (${sub.marks}/100)` : 'Under Company Review'}
                    </span>
                    <span class="text-muted" style="font-size:0.75rem;">Submitted: ${sub.submissionDate}</span>
                  </div>
                  <div style="font-size:0.85rem; color:#334155; margin-bottom:0.5rem;">
                    <strong>Solution Code / Query:</strong>
                    <div style="font-family:monospace; background:#f1f5f9; padding:0.5rem; border-radius:4px; margin-top:0.25rem;">${sub.submissionText}</div>
                  </div>
                  <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap;">
                    <span class="badge-pill info"><i class="fa-solid fa-file-pdf"></i> ${sub.projectFileName}</span>
                    <a href="${sub.githubUrl}" target="_blank" class="badge-pill info" style="text-decoration:none;"><i class="fa-brands fa-github"></i> GitHub Repository</a>
                  </div>
                  ${sub.evaluationStatus === 'Graded' ? `
                    <div style="border-top:1px solid #f1f5f9; padding-top:0.5rem; font-size:0.85rem;">
                      <strong style="color:var(--primary);"><i class="fa-solid fa-comment-dots"></i> Mentor Feedback (${sub.evaluator}):</strong>
                      <p style="color:#475569; margin:0.25rem 0;">${sub.feedback}</p>
                      <div style="margin-top:0.35rem;"><span class="badge-pill badge-employed"><i class="fa-solid fa-award"></i> Endorsed Competency: ${sub.skillEndorsed || 'Verified'}</span></div>
                    </div>
                  ` : `
                    <p class="text-muted" style="font-size:0.8rem; margin:0.25rem 0;"><i class="fa-solid fa-info-circle"></i> Tech Solutions review board is currently evaluating your submission. Feedback and marks will be published here.</p>
                  `}
                </div>
              `;
            } else {
              return `
                <form onsubmit="handleProjectWorkSubmit(event, '${currentCourse.id}')">
                  <div class="form-group">
                    <label>Solution Description / Query Code</label>
                    <textarea id="asgInputText" rows="3" placeholder="SELECT district_name, SUM(deficit_count) FROM health_warehouse WHERE supply_status = 'Critical' GROUP BY district_name..." required></textarea>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Upload Project PDF / Architecture Doc</label>
                      <input type="file" id="asgInputFile" accept=".pdf,.doc,.docx,.zip" onchange="handleAsgFileSelected(event)" />
                      <span class="text-muted" style="font-size:0.7rem;" id="asgFileLabel">Accepted: PDF, DOCX, ZIP (Max 15MB)</span>
                    </div>
                    <div class="form-group">
                      <label>GitHub Repository URL</label>
                      <input type="url" id="asgInputGithub" value="https://github.com/rohit-patil-dev/health-tracker" required />
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg" style="margin-top:0.5rem;"><i class="fa-solid fa-paper-plane"></i> Submit Project to Company for Evaluation</button>
                </form>
              `;
            }
          })()}
        </div>
      </div>

      <!-- Tab 3: Certification Quiz -->
      <div id="cContentQuiz" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h4 style="color:var(--primary); margin:0;"><i class="fa-solid fa-award"></i> ${currentCourse.quiz.title}</h4>
          ${currentCourse.quiz.passed ? `
            <span class="badge-pill badge-employed" style="font-size:0.85rem;"><i class="fa-solid fa-circle-check"></i> PASSED (${currentCourse.quiz.score}) &bull; CREDENTIAL ISSUED</span>
          ` : `
            <span class="badge-pill info">Pass Mark: 66% &bull; Generates State Digital Credential</span>
          `}
        </div>

        <form id="courseQuizForm" onsubmit="handleQuizSubmit(event, '${currentCourse.id}')">
          ${(currentCourse.quiz.questions || []).map((q, qIdx) => `
            <div style="padding:1rem; border:1px solid #e2e8f0; border-radius:var(--radius-sm); margin-bottom:1rem; background:#ffffff;">
              <strong style="font-size:0.95rem; display:block; margin-bottom:0.6rem;">Question ${qIdx + 1}: ${q.q}</strong>
              <div style="display:flex; flex-direction:column; gap:0.4rem;">
                ${q.options.map((opt, oIdx) => `
                  <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; cursor:pointer;">
                    <input type="radio" name="q_${qIdx}" value="${oIdx}" ${oIdx === q.correct && currentCourse.quiz.passed ? 'checked' : ''} required />
                    <span>${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <button type="submit" class="btn btn-primary btn-lg" style="margin-top:0.5rem;"><i class="fa-solid fa-circle-check"></i> Submit Quiz Answers & Issue Credential</button>
        </form>
      </div>
    </div>
  `;
}

function switchCoursePlayerTab(tab) {
  document.getElementById('cTabLessons').classList.remove('active');
  document.getElementById('cTabAssignment').classList.remove('active');
  document.getElementById('cTabQuiz').classList.remove('active');

  document.getElementById('cContentLessons').style.display = 'none';
  document.getElementById('cContentAssignment').style.display = 'none';
  document.getElementById('cContentQuiz').style.display = 'none';

  if (tab === 'lessons') {
    document.getElementById('cTabLessons').classList.add('active');
    document.getElementById('cContentLessons').style.display = 'block';
  } else if (tab === 'assignment') {
    document.getElementById('cTabAssignment').classList.add('active');
    document.getElementById('cContentAssignment').style.display = 'block';
  } else if (tab === 'quiz') {
    document.getElementById('cTabQuiz').classList.add('active');
    document.getElementById('cContentQuiz').style.display = 'block';
  }
}

function markLessonComplete(courseId, lessonId) {
  const course = window.SKT_STATE.courses.find(c => c.id === courseId);
  if (course) {
    const les = course.lessons.find(l => l.id === lessonId);
    if (les) les.completed = true;
    window.saveLocalSktState();
    showToast(`Lesson completed! Progress recorded.`, 'success');
    navToStudentView('courses', courseId);
  }
}

let currentAsgFileName = "project_deliverable.pdf";
let currentAsgFileData = null;

function handleAsgFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  currentAsgFileName = file.name;
  const lbl = document.getElementById('asgFileLabel');
  if (lbl) lbl.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  showToast(`File "${file.name}" ready for submission!`, "info");
}

function handleProjectWorkSubmit(e, courseId) {
  e.preventDefault();
  const submissionText = document.getElementById('asgInputText').value.trim();
  const githubUrl = (document.getElementById('asgInputGithub').value || "https://github.com/rohit-patil-dev").trim();

  window.submitStudentProjectWork(courseId, {
    submissionText,
    projectFileName: currentAsgFileName,
    projectFileUrl: currentAsgFileData || `https://skilltrack.org/deliverables/${currentAsgFileName}`,
    githubUrl
  });
}

function handleAssignmentSubmit(e, courseId) {
  e.preventDefault();
  const text = document.getElementById('assignmentInput').value.trim();
  window.submitCourseAssignment(courseId, text);
}

function handleQuizSubmit(e, courseId) {
  e.preventDefault();
  const course = window.SKT_STATE.courses.find(c => c.id === courseId);
  if (!course) return;

  const answers = [];
  course.quiz.questions.forEach((q, idx) => {
    const sel = document.querySelector(`input[name="q_${idx}"]:checked`);
    answers.push(sel ? sel.value : -1);
  });

  window.submitCourseQuiz(courseId, answers);
}

// ================= 3. MY APPLICATIONS & INTERVIEW TRACKER ================= //
function renderStudentApplicationsTracker(container, s) {
  const apps = (window.SKT_STATE.applications || []).filter(a => a.studentId === s.id);

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>My Job Applications & Interview Information</h2>
        <p>Real-time lifecycle tracking: <strong>Application &rarr; Shortlist &rarr; Interview Scheduled &rarr; Selection</strong>.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="navToStudentView('search')"><i class="fa-solid fa-magnifying-glass"></i> Explore More Job Openings</button>
    </div>

    ${apps.length === 0 ? `
      <div class="card" style="text-align:center; padding:3rem 1rem;">
        <i class="fa-solid fa-paper-plane" style="font-size:2.5rem; color:#cbd5e1; margin-bottom:1rem;"></i>
        <h3>No Job Applications Yet</h3>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:1rem;">Search skills or view matched openings to submit 1-click applications.</p>
        <button class="btn btn-primary" onclick="navToStudentView('search')"><i class="fa-solid fa-magnifying-glass"></i> Search Skills & Jobs</button>
      </div>
    ` : `
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${apps.map(app => {
          const isSelected = app.status === 'Selected';
          const isInterview = app.status === 'Interview Scheduled' || isSelected;
          const isShortlisted = app.status === 'Shortlisted' || isInterview || isSelected;

          return `
            <div class="card" style="border-left: 5px solid ${isSelected ? '#10b981' : (isInterview ? '#3b82f6' : (isShortlisted ? '#f59e0b' : '#64748b'))};">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
                <div style="display:flex; gap:1rem; align-items:center;">
                  <img src="${app.companyLogo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}" onerror="handleAvatarError(this)" style="width:50px; height:50px; border-radius:var(--radius-sm); object-fit:cover;" />
                  <div>
                    <h3 style="font-size:1.15rem; margin-bottom:0.2rem;">${app.jobTitle}</h3>
                    <p class="text-muted" style="font-size:0.85rem;"><i class="fa-solid fa-building"></i> ${app.companyName} &bull; Applied: ${app.appliedDate}</p>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="badge-pill ${isSelected ? 'badge-employed' : (isInterview ? 'info' : 'warning')}" style="font-size:0.85rem; padding:0.35rem 0.75rem;">
                    <i class="fa-solid ${isSelected ? 'fa-check-double' : (isInterview ? 'fa-video' : 'fa-clock')}"></i> STATUS: ${app.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <!-- 4-Stage Stepper Progress -->
              <div style="display:flex; justify-content:space-between; margin:1.5rem 0 1rem; position:relative;">
                <div style="text-align:center; flex:1;">
                  <div style="width:30px; height:30px; border-radius:50%; background:#10b981; color:#fff; margin:0 auto 0.35rem; display:flex; align-items:center; justify-content:center; font-size:0.8rem;"><i class="fa-solid fa-check"></i></div>
                  <strong style="font-size:0.75rem;">1. Applied</strong>
                </div>
                <div style="text-align:center; flex:1;">
                  <div style="width:30px; height:30px; border-radius:50%; background:${isShortlisted ? '#10b981' : '#e2e8f0'}; color:${isShortlisted ? '#fff' : '#64748b'}; margin:0 auto 0.35rem; display:flex; align-items:center; justify-content:center; font-size:0.8rem;"><i class="fa-solid ${isShortlisted ? 'fa-check' : 'fa-2'}"></i></div>
                  <strong style="font-size:0.75rem;">2. Shortlisted</strong>
                </div>
                <div style="text-align:center; flex:1;">
                  <div style="width:30px; height:30px; border-radius:50%; background:${isInterview ? '#2563eb' : '#e2e8f0'}; color:${isInterview ? '#fff' : '#64748b'}; margin:0 auto 0.35rem; display:flex; align-items:center; justify-content:center; font-size:0.8rem;"><i class="fa-solid ${isInterview ? 'fa-video' : 'fa-3'}"></i></div>
                  <strong style="font-size:0.75rem;">3. Interview</strong>
                </div>
                <div style="text-align:center; flex:1;">
                  <div style="width:30px; height:30px; border-radius:50%; background:${isSelected ? '#10b981' : '#e2e8f0'}; color:${isSelected ? '#fff' : '#64748b'}; margin:0 auto 0.35rem; display:flex; align-items:center; justify-content:center; font-size:0.8rem;"><i class="fa-solid ${isSelected ? 'fa-award' : 'fa-4'}"></i></div>
                  <strong style="font-size:0.75rem;">4. Selected</strong>
                </div>
              </div>

              <!-- Interview Details Box (If Interview Scheduled or Selected) -->
              ${app.interviewInfo ? `
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-sm); padding:1.25rem; margin-top:1rem;">
                  <h4 style="color:#1e40af; font-size:0.95rem; margin-bottom:0.5rem;"><i class="fa-solid fa-calendar-check"></i> Confirmed Company Interview Schedule & Meeting Details</h4>
                  <div class="grid-2col-even" style="gap:0.75rem; font-size:0.85rem;">
                    <div><strong>Interview Round:</strong> ${app.interviewInfo.round}</div>
                    <div><strong>Scheduled Date & Time:</strong> ${app.interviewInfo.date} at ${app.interviewInfo.time}</div>
                    <div><strong>Interviewer:</strong> ${app.interviewInfo.interviewer}</div>
                    <div><strong>Interview Mode:</strong> ${app.interviewInfo.mode}</div>
                  </div>
                  <p style="font-size:0.8rem; color:#475569; margin:0.5rem 0;"><strong>Company Feedback:</strong> "${app.interviewInfo.feedback}"</p>
                  <div style="margin-top:0.75rem;">
                    <a href="${app.interviewInfo.meetingLink}" target="_blank" class="btn btn-sm btn-primary" style="background:#2563eb;"><i class="fa-solid fa-video"></i> Join Live Google Meet</a>
                  </div>
                </div>
              ` : ''}

              ${isSelected ? `
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-sm); padding:1rem; margin-top:1rem;">
                  <strong style="color:#166534; display:block; margin-bottom:0.25rem;"><i class="fa-solid fa-circle-check"></i> Offer Finalized & Confirmed!</strong>
                  <p style="font-size:0.85rem; color:#15803d; margin:0;">
                    Tech Solutions Pvt. Ltd. has confirmed your selection as ${app.jobTitle}. Your employment record and salary telemetry are permanently verified in the state ledger.
                  </p>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

// ================= 4. DASHBOARD, PASSPORT, PROFILE & OTHER VIEWS ================= //
function renderStudentDashboard(container, s) {
  const ce = s.currentEmployment || {};
  const activeApps = (window.SKT_STATE.applications || []).filter(a => a.studentId === s.id);

  container.innerHTML = `
    <!-- Top Hero Banner: Digital Skill Passport -->
    <div class="card" style="background: linear-gradient(135deg, #0b1528 0%, #1e3a8a 100%); color: #ffffff; border: none; margin-bottom: 1.5rem; position: relative; overflow: hidden;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
            <span class="badge-pill info" style="background:rgba(255,255,255,0.2); color:#fff; font-size:0.75rem;"><i class="fa-solid fa-id-card"></i> DIGITAL SKILL PASSPORT</span>
            <span class="badge-pill badge-employed" style="font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> PERMANENT UNIQUE SKILL ID</span>
          </div>
          <h2 style="font-size:1.6rem; font-weight:800; color:#fff; margin-bottom:0.25rem;">${s.fullName}</h2>
          <p style="color:#94a3b8; font-size:0.85rem;"><i class="fa-solid fa-fingerprint"></i> Permanent ID: <strong style="color:#60a5fa; font-family:monospace; font-size:0.95rem;">${s.digitalSkillPassportId}</strong></p>
          <p style="color:#cbd5e1; font-size:0.85rem; margin-top:0.35rem;">
            Unified state credential connecting your skills, courses, mentor endorsements, and verified employment.
          </p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-sm btn-primary" onclick="navToStudentView('search', 'Data Analytics')" style="background:#2563eb; color:#fff;"><i class="fa-solid fa-magnifying-glass"></i> Search Skills</button>
          <button class="btn btn-sm btn-outline" onclick="navToStudentView('passport')" style="color:#fff; border-color:rgba(255,255,255,0.4);"><i class="fa-solid fa-qrcode"></i> View Passport</button>
        </div>
      </div>
    </div>

    <div class="welcome-row">
      <div>
        <h2>Career Progress Hub</h2>
        <p>Skills acquisition, live job matches, and verified retention tracking.</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-outline" onclick="navToStudentView('applications')"><i class="fa-solid fa-paper-plane"></i> My Applications (${activeApps.length})</button>
        <button class="btn btn-primary" onclick="navToStudentView('courses')"><i class="fa-solid fa-graduation-cap"></i> My Courses & Quizzes</button>
      </div>
    </div>

    <!-- Macro Metrics -->
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Verified Skills</span><strong class="stat-val">${(s.skills || []).length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Academic Attendance</span><strong class="stat-val highlight-green">${s.attendanceRate || '94%'}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Active Applications</span><strong class="stat-val highlight-blue">${activeApps.length}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Cumulative CGPA</span><strong class="stat-val highlight-purple">${s.cgpa || '8.85 / 10.0'}</strong></div>
    </div>

    <!-- Assigned Academic Faculty Mentor & Notices -->
    <div class="grid-2col-even" style="margin-bottom: 1.5rem;">
      <div class="card" style="border-left: 4px solid #7c3aed;">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-chalkboard-user" style="color:#7c3aed;"></i> Assigned Faculty Mentor</h3>
          <span class="badge-pill info" style="font-family:monospace;">${s.facultyId || 'FAC-101'}</span>
        </div>
        ${(() => {
          const fac = (window.SKT_STATE.faculty || []).find(f => f.facultyId === s.facultyId) || (window.SKT_STATE.faculty && window.SKT_STATE.faculty[0]);
          return `
            <div style="display:flex; align-items:center; gap:1rem; margin:0.75rem 0;">
              <img src="${(fac && fac.avatarUrl) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'}" onerror="handleAvatarError(this)" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:2px solid #7c3aed;" />
              <div>
                <strong style="font-size:1.05rem; display:block;">${s.facultyName || (fac ? fac.name : 'Prof. Arvind Joshi')}</strong>
                <span style="font-size:0.8rem; color:#64748b;">${(fac && fac.department) || 'Computer Science & Cloud Systems'}</span>
                <p style="font-size:0.75rem; color:#475569; margin:0.25rem 0 0;"><i class="fa-solid fa-envelope"></i> ${(fac && fac.email) || 'arvind.joshi@faculty.skilltrack.org'}</p>
              </div>
            </div>
            <p style="font-size:0.8rem; color:#64748b; margin:0;"><strong>Office Hours:</strong> ${(fac && fac.officeHours) || 'Mon-Thu 2:00 PM - 5:00 PM'}</p>
          `;
        })()}
      </div>

      <div class="card" style="border-left: 4px solid #f59e0b;">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-bullhorn" style="color:#f59e0b;"></i> Faculty Academic Notices</h3>
          ${(() => {
            const notices = (window.SKT_STATE.facultyAnnouncements || []).filter(a => a.facultyId === s.facultyId);
            return `<span class="badge-pill warning">${notices.length} Notices</span>`;
          })()}
        </div>
        ${(() => {
          const notices = (window.SKT_STATE.facultyAnnouncements || []).filter(a => a.facultyId === s.facultyId);
          if (notices.length === 0) return '<p class="text-muted" style="font-size:0.85rem; padding:0.5rem 0;">No new notices for your assigned cohort.</p>';
          return `
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.4rem;">
              ${notices.slice(0, 2).map(n => `
                <div style="background:#fefce8; border:1px solid #fef08a; border-radius:var(--radius-sm); padding:0.5rem 0.75rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.2rem;">
                    <strong style="font-size:0.825rem; color:#854d0e;">${n.title}</strong>
                    <span class="badge-pill warning" style="font-size:0.65rem;">${n.priority}</span>
                  </div>
                  <p style="font-size:0.75rem; color:#713f12; margin:0; line-height:1.4;">${n.content}</p>
                  <span style="font-size:0.68rem; color:#a16207; display:block; margin-top:0.2rem;"><i class="fa-solid fa-calendar-day"></i> ${n.date} &bull; ${n.facultyName}</span>
                </div>
              `).join('')}
            </div>
          `;
        })()}
      </div>
    </div>

    <!-- Connected Ecosystem Quick Links -->
    <div class="grid-2col-even" style="margin-bottom: 1.5rem;">
      <div class="card" style="border-left: 4px solid #2563eb;">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-magnifying-glass text-primary"></i> Skill Search & Learning Paths</h3>
          <button class="btn btn-sm btn-outline" onclick="navToStudentView('search', 'Data Analytics')">Search &rarr;</button>
        </div>
        <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
          Explore Data Analytics, AWS Cloud, and Full Stack to view companies, jobs, courses, and mentor lessons.
        </p>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <span class="badge-pill info" style="cursor:pointer;" onclick="navToStudentView('search', 'Data Analytics')">Data Analytics</span>
          <span class="badge-pill info" style="cursor:pointer;" onclick="navToStudentView('search', 'AWS Cloud')">AWS Cloud</span>
          <span class="badge-pill info" style="cursor:pointer;" onclick="navToStudentView('search', 'Full Stack')">Full Stack</span>
        </div>
      </div>

      <div class="card" style="border-left: 4px solid #10b981;">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-list-check text-green"></i> Application & Interview Status</h3>
          <button class="btn btn-sm btn-outline" onclick="navToStudentView('applications')">View Tracker &rarr;</button>
        </div>
        <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
          Real-time updates directly from employer HR with meeting links and confirmed rounds.
        </p>
        <div>
          <span class="badge-pill badge-employed"><i class="fa-solid fa-video"></i> ${activeApps.filter(a => a.status.includes('Interview') || a.status === 'Selected').length} Active / Scheduled</span>
        </div>
      </div>
    </div>

    <!-- Current Employment & Timeline -->
    <div class="grid-2col-even">
      <div class="card">
        <div class="card-head space-between">
          <h3>Verified Employment Telemetry</h3>
          <button class="btn btn-sm btn-outline" onclick="navToStudentView('employment')"><i class="fa-solid fa-pen"></i> Update Status</button>
        </div>
        <div class="employment-details-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-top:0.5rem;">
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Company</span><strong>${ce.company}</strong></div>
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Designation</span><strong>${ce.jobRole}</strong></div>
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Work Location</span><strong>${ce.location}</strong></div>
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Monthly Package</span><strong class="highlight-green">${ce.monthlySalary}</strong></div>
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Employer Verification</span><strong style="color:#10b981;"><i class="fa-solid fa-shield-check"></i> ${ce.verificationScore || 'Confirmed'}</strong></div>
          <div class="detail-item"><span class="text-muted" style="font-size:0.75rem; display:block;">Active Tenure</span><strong>Since ${ce.since}</strong></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Career Milestones Timeline</h3></div>
        <div class="vertical-timeline" style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem;">
          ${(s.employmentTimeline || []).map(t => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid #f1f5f9;">
              <div><i class="fa-solid fa-circle-check" style="color:#10b981; margin-right:0.5rem;"></i><strong>${t.stage}</strong></div>
              <span class="text-muted" style="font-size:0.8rem;">${t.date}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDigitalSkillPassport(container, s) {
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Digital Skill Passport (Permanent Unique Skill ID)</h2>
        <p>A single, unchangeable state credential unifying your certificates, skills, jobs, and career history.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Passport Dossier</button>
    </div>

    <div class="card" style="border: 2px solid #1d4ed8; padding: 2rem; border-radius: var(--radius-lg); background: #ffffff; max-width: 850px; margin-bottom: 2rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #e2e8f0; padding-bottom:1.5rem; margin-bottom:1.5rem;">
        <div style="display:flex; gap:1.25rem; align-items:center;">
          <img src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:85px; height:85px; border-radius:50%; object-fit:cover; border:3px solid #1d4ed8;" />
          <div>
            <span class="badge-pill badge-employed" style="margin-bottom:0.35rem;"><i class="fa-solid fa-shield-check"></i> OFFICIAL MAHARASHTRA SKILL PASSPORT</span>
            <h2 style="font-size:1.5rem; font-weight:800; color:#0f172a; margin-bottom:0.2rem;">${s.fullName}</h2>
            <p class="text-muted" style="font-size:0.85rem;"><i class="fa-solid fa-location-dot"></i> District: <strong>${s.district}, Maharashtra</strong> &bull; <i class="fa-solid fa-graduation-cap"></i> ${s.college}</p>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.75rem; color:#64748b; text-transform:uppercase; font-weight:700;">Permanent Passport ID</div>
          <code style="font-size:1.15rem; font-weight:800; color:#1d4ed8; background:#eff6ff; padding:0.25rem 0.6rem; border-radius:var(--radius-sm);">${s.digitalSkillPassportId}</code>
          <span class="badge-employed" style="display:block; margin-top:0.4rem; font-size:0.7rem;">STATUS: PERMANENT & ACTIVE</span>
        </div>
      </div>

      <div class="grid-2col-even" style="gap:1.5rem;">
        <div>
          <h4 style="color:#1d4ed8; margin-bottom:0.5rem;"><i class="fa-solid fa-award"></i> Verified Competencies</h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${(s.skills || []).map(sk => `<span class="badge-pill info" style="font-size:0.75rem;">${typeof sk === 'string' ? sk : sk.name}</span>`).join('')}
          </div>
        </div>

        <div>
          <h4 style="color:#1d4ed8; margin-bottom:0.5rem;"><i class="fa-solid fa-certificate"></i> Digital Credentials</h4>
          <ul style="padding-left:1.25rem; font-size:0.85rem; line-height:1.7;">
            ${(s.certificates || []).map(c => `<li><strong>${c.title}</strong> (${c.issuer}) &bull; <code>${c.credentialId}</code></li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function renderJobMatchingSystem(container, s) {
  const jobs = (window.SKT_STATE.industry && window.SKT_STATE.industry.jobs) ? window.SKT_STATE.industry.jobs : [];
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>Intelligent Job Matching System</h2><p>Positions matched against your <strong>Skills</strong> + <strong>Location (${s.district})</strong> + <strong>Salary (${s.salaryExpectation})</strong>.</p></div>
    </div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${jobs.map(j => {
        const hasApplied = (window.SKT_STATE.applications || []).some(a => a.jobId === j.id && a.studentId === s.id);
        return `
          <div class="feature-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3>${j.title}</h3>
                <span class="text-muted" style="font-size:0.85rem;"><i class="fa-solid fa-building"></i> Tech Solutions &bull; ${j.district}</span>
              </div>
              <span class="badge-pill badge-employed">${j.jobType}</span>
            </div>
            <p style="margin:0.75rem 0; font-size:0.85rem;"><strong>Package:</strong> ${j.salaryRange}<br><strong>Experience:</strong> ${j.experience}</p>
            <div style="margin-bottom:0.75rem;">
              ${(j.requiredSkills || []).map(r => `<span class="badge-pill info" style="margin-right:0.2rem;">${r}</span>`).join('')}
            </div>
            <div style="display:flex; gap:0.5rem;">
              ${hasApplied ? `
                <button class="btn btn-outline btn-sm" onclick="navToStudentView('applications')" style="color:#10b981; border-color:#10b981;"><i class="fa-solid fa-check"></i> Applied (Track Status)</button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="window.applyForJob(${j.id})"><i class="fa-solid fa-paper-plane"></i> 1-Click Apply</button>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderSkillGapRecommendations(container, s) {
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>AI Skill-Gap Detection & Learning Recommendation</h2><p>Identifies skills missing for available jobs and generates immediate curriculum paths.</p></div>
    </div>
    <div class="card" style="border-left:5px solid #2563eb; margin-bottom:1.5rem;">
      <span class="badge-pill info" style="margin-bottom:0.35rem;">ALGORITHMIC SKILL GAP DEMONSTRATION</span>
      <h3 style="font-size:1.15rem; margin-bottom:0.25rem;">Target Opening: Business Data & Operations Analyst</h3>
      <p class="text-muted" style="font-size:0.85rem;">Tech Solutions Pvt. Ltd. &bull; Package: ₹24,000 - ₹30,000 / month &bull; Pune</p>
      <div class="grid-2col-even" style="margin:1rem 0; gap:1rem;">
        <div style="background:#f8fafc; padding:1rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
          <h4 style="font-size:0.85rem; color:#475569; margin-bottom:0.4rem;">Job Mandatory Requirements</h4>
          <span class="badge-pill info">Excel</span> <span class="badge-pill info">SQL</span> <span class="badge-pill info">Communication</span>
          <h4 style="font-size:0.85rem; color:#475569; margin:0.8rem 0 0.4rem;">Trainee's Current Verified Competencies</h4>
          <span class="badge-pill badge-employed"><i class="fa-solid fa-check"></i> Excel</span>
        </div>
        <div style="background:#fffbeb; padding:1rem; border-radius:var(--radius-sm); border:1px solid #fde68a;">
          <h4 style="font-size:0.9rem; color:#92400e; margin-bottom:0.35rem;"><i class="fa-solid fa-triangle-exclamation"></i> AI Recommendation:</h4>
          <p style="font-size:0.9rem; color:#1e293b;">&rarr; <strong>Learn SQL + Communication</strong> to achieve 100% eligibility.</p>
          <button class="btn btn-sm btn-primary" onclick="navToStudentView('courses', 'data-analytics')" style="background:#d97706; border-color:#d97706; margin-top:0.5rem;"><i class="fa-solid fa-graduation-cap"></i> Enroll in SQL & Communication Module</button>
        </div>
      </div>
    </div>
  `;
}

function renderEmploymentTracking(container, s) {
  const ce = s.currentEmployment || {};
  const status = s.employmentStatus || 'employed';

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Multi-Stream Employment Tracking & Longitudinal Status</h2>
        <p>Consent-based reporting for formal jobs, apprenticeships, self-employment, and reasons for non-placement.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToStudentView('dashboard')"><i class="fa-solid fa-arrow-left"></i> Dashboard</button>
    </div>

    <div class="card" style="max-width:800px;">
      <form onsubmit="saveEmploymentTrackingStatus(event)">
        <div class="form-group">
          <label style="font-weight:700;">Select Current Livelihood / Employment Track</label>
          <select id="empStatusSelect" onchange="toggleEmploymentFormFields(this.value)" style="font-weight:600; background:#f8fafc;">
            <option value="employed" ${status === 'employed' ? 'selected' : ''}>🏢 Formally Employed (Corporate / Industry Placement)</option>
            <option value="apprenticeship" ${status === 'apprenticeship' ? 'selected' : ''}>🛠️ Apprenticeship (NAPS / MAPS State Scheme)</option>
            <option value="self_employed" ${status === 'self_employed' ? 'selected' : ''}>🚀 Self-Employed / Micro-Entrepreneur (Udyam Verified)</option>
            <option value="unemployed" ${status === 'unemployed' ? 'selected' : ''}>🔍 Currently Unemployed / Seeking Work (Diagnostic Survey)</option>
          </select>
        </div>

        <!-- 1. Formal Employment Fields -->
        <div id="trackFormal" style="${status === 'employed' ? 'display:block;' : 'display:none;'}">
          <h4 style="color:var(--primary); margin:1rem 0 0.5rem;"><i class="fa-solid fa-building"></i> Corporate Employment Verification</h4>
          <div class="form-row">
            <div class="form-group"><label>Employer / Company Name</label><input type="text" id="etCompany" value="${ce.company || 'Tech Solutions Pvt. Ltd.'}" /></div>
            <div class="form-group"><label>Job Designation / Role</label><input type="text" id="etRole" value="${ce.jobRole || 'Junior Software Developer'}" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Monthly In-Hand Salary</label><input type="text" id="etSalary" value="${ce.monthlySalary || '₹28,000'}" /></div>
            <div class="form-group"><label>Work Location (City/District)</label><input type="text" id="etLocation" value="${ce.location || 'Pune, Maharashtra'}" /></div>
          </div>
        </div>

        <!-- 2. Apprenticeship Fields -->
        <div id="trackApprentice" style="${status === 'apprenticeship' ? 'display:block;' : 'display:none;'}">
          <h4 style="color:var(--primary); margin:1rem 0 0.5rem;"><i class="fa-solid fa-wrench"></i> Apprenticeship Scheme Information</h4>
          <div class="form-row">
            <div class="form-group"><label>Establishment / Training Industry</label><input type="text" id="etAppCompany" value="Tata AutoComp Systems Ltd." /></div>
            <div class="form-group"><label>Apprenticeship Trade</label><input type="text" id="etAppTrade" value="Industrial IoT & Embedded Systems" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>NAPS / MAPS Contract ID</label><input type="text" id="etAppContract" value="MH-NAPS-2025-00984" /></div>
            <div class="form-group"><label>Monthly Stipend</label><input type="text" id="etAppStipend" value="₹18,500 / month" /></div>
          </div>
        </div>

        <!-- 3. Self-Employment / Entrepreneurship Fields -->
        <div id="trackSelf" style="${status === 'self_employed' ? 'display:block;' : 'display:none;'}">
          <h4 style="color:var(--primary); margin:1rem 0 0.5rem;"><i class="fa-solid fa-shop"></i> Micro-Enterprise & Self-Employment Telemetry</h4>
          <div class="form-row">
            <div class="form-group"><label>Enterprise / Business Name</label><input type="text" id="etSelfBiz" value="Patil Cloud Solutions & Consulting" /></div>
            <div class="form-group"><label>Udyam Registration Number (MSME)</label><input type="text" id="etSelfUdyam" value="UDYAM-MH-26-0045182" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Average Monthly Net Revenue</label><input type="text" id="etSelfIncome" value="₹35,000 / month" /></div>
            <div class="form-group"><label>Sector / Business Domain</label><input type="text" id="etSelfSector" value="IT Services & Digital Architecture" /></div>
          </div>
        </div>

        <!-- 4. Unemployed & Non-Placement Diagnostic Questionnaire -->
        <div id="trackUnemployed" style="${status === 'unemployed' ? 'display:block;' : 'display:none;'}">
          <div style="background:#fffbeb; padding:1.25rem; border:1px solid #fde68a; border-radius:var(--radius-sm); margin-bottom:1.25rem;">
            <h4 style="color:#92400e; margin-bottom:0.5rem;"><i class="fa-solid fa-triangle-exclamation"></i> Reason for Non-Placement Diagnostic Survey</h4>
            <p style="font-size:0.85rem; color:#78350f; margin-bottom:1rem;">
              The Government of Maharashtra uses this data to trigger proactive remedial training, relocation stipends, and institute curriculum audits.
            </p>
            <div class="form-group">
              <label style="font-weight:700;">Primary Reason for Unemployment / Non-Placement</label>
              <select id="etReasonSelect" style="background:#ffffff; font-weight:600;">
                <option value="Skill Mismatch">1. Skill mismatch (Training did not match company vacancy requirements)</option>
                <option value="Low Salary Offered">2. Low salary offered (Below living wage threshold)</option>
                <option value="Location / Commute Problem">3. Location / Commute problem (Jobs too far from district home)</option>
                <option value="No Suitable Jobs Locally">4. No suitable jobs available locally in district</option>
                <option value="Failed Interview / Assessment">5. Failed technical interview or assessment</option>
                <option value="Higher Studies Pursued">6. Pursuing higher studies / degree full-time</option>
                <option value="Left Training / Exam Pending">7. Training left incomplete / exam pending</option>
                <option value="Other Personal Reasons">8. Other personal / family reasons</option>
              </select>
            </div>
            <div class="form-group">
              <label>Additional Context / Remedial Support Requested</label>
              <textarea id="etReasonNotes" rows="2" placeholder="e.g. Requesting placement assistance in Pune city or advanced cloud certification..."></textarea>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-floppy-disk"></i> Update Verified Employment Telemetry</button>
      </form>
    </div>
  `;
}

function toggleEmploymentFormFields(track) {
  const formal = document.getElementById('trackFormal');
  const apprentice = document.getElementById('trackApprentice');
  const self = document.getElementById('trackSelf');
  const unemp = document.getElementById('trackUnemployed');

  if (formal) formal.style.display = track === 'employed' ? 'block' : 'none';
  if (apprentice) apprentice.style.display = track === 'apprenticeship' ? 'block' : 'none';
  if (self) self.style.display = track === 'self_employed' ? 'block' : 'none';
  if (unemp) unemp.style.display = track === 'unemployed' ? 'block' : 'none';
}

function saveEmploymentTrackingStatus(e) {
  e.preventDefault();
  const s = window.SKT_STATE.student;
  const chosenTrack = document.getElementById('empStatusSelect').value;
  s.employmentStatus = chosenTrack;

  if (chosenTrack === 'employed') {
    s.currentEmployment.company = document.getElementById('etCompany').value.trim();
    s.currentEmployment.jobRole = document.getElementById('etRole').value.trim();
    s.currentEmployment.monthlySalary = document.getElementById('etSalary').value.trim();
    s.currentEmployment.location = document.getElementById('etLocation').value.trim();
    s.currentEmployment.employmentType = "Full Time (Industry Placed)";
    s.unemploymentReason = "";
  } else if (chosenTrack === 'apprenticeship') {
    s.currentEmployment.company = document.getElementById('etAppCompany').value.trim();
    s.currentEmployment.jobRole = document.getElementById('etAppTrade').value.trim();
    s.currentEmployment.monthlySalary = document.getElementById('etAppStipend').value.trim();
    s.currentEmployment.employmentType = "Apprenticeship (NAPS/MAPS)";
    s.unemploymentReason = "";
  } else if (chosenTrack === 'self_employed') {
    s.currentEmployment.company = document.getElementById('etSelfBiz').value.trim();
    s.currentEmployment.jobRole = "Micro-Entrepreneur";
    s.currentEmployment.monthlySalary = document.getElementById('etSelfIncome').value.trim();
    s.currentEmployment.employmentType = "Self-Employed (Udyam Verified)";
    s.unemploymentReason = "";
  } else if (chosenTrack === 'unemployed') {
    s.unemploymentReason = document.getElementById('etReasonSelect').value;
    s.currentEmployment.company = "Currently Seeking Placement";
    s.currentEmployment.jobRole = "Candidate in Remedial Pipeline";
  }

  window.saveLocalSktState();
  showToast("Longitudinal employment status updated successfully!", "success");
  navToStudentView('dashboard');
}

function renderAutomaticFollowups(container, s) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Automatic Post-Placement Follow-ups</h2><p>Quarterly retention check-ins after 3, 6, and 12 months.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Milestone</th><th>Date</th><th>Student Status</th><th>Employer Verification</th><th>Verified Salary</th><th>Audit</th></tr></thead>
          <tbody>
            ${(s.followUps || []).map(f => `
              <tr>
                <td><strong>${f.period}</strong></td>
                <td>${f.scheduledDate}</td>
                <td><span class="badge-pill ${f.studentResponse ? 'badge-employed' : 'warning'}">${f.studentResponse ? 'Completed' : 'Due Now'}</span></td>
                <td>${f.employerVerified ? '<span class="badge-pill badge-employed">Confirmed by HR</span>' : 'Pending'}</td>
                <td><strong class="highlight-green">${f.verifiedSalary || '₹28,000 / month'}</strong></td>
                <td><span class="badge-pill ${f.status === 'Completed' ? 'badge-employed' : 'warning'}">${f.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStudentIndustryOpportunities(container, s) {
  const industries = window.SKT_STATE.industryDirectoryForStudents || [];
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Industry Opportunities & Companies</h2><p>Verified enterprises actively recruiting SkillTrack graduates.</p></div></div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${industries.map(ind => `
        <div class="feature-card">
          <div style="display:flex; gap:0.75rem; align-items:center; margin-bottom:0.5rem;">
            <img src="${ind.logo}" onerror="handleAvatarError(this)" style="width:40px; height:40px; border-radius:var(--radius-sm); object-fit:cover;" />
            <div>
              <h3>${ind.name}</h3>
              <span class="badge-pill badge-employed" style="font-size:0.7rem;">${ind.trustScore}</span>
            </div>
          </div>
          <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.5rem;">${ind.description}</p>
          <button class="btn btn-sm btn-primary" onclick="navToStudentView('search', 'Data Analytics')">View Opportunities &rarr;</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStudentEmployeeMentors(container, s) {
  const mentors = window.SKT_STATE.employeeMentorsForStudents || [];
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Industry Employee Mentors</h2><p>Verified professionals providing 1-on-1 technical guidance.</p></div></div>
    <div class="features-grid" style="grid-template-columns: repeat(3, 1fr);">
      ${mentors.map(m => `
        <div class="feature-card" style="text-align:center;">
          <img src="${m.avatar}" onerror="handleAvatarError(this)" style="width:65px; height:65px; border-radius:50%; margin:0 auto 0.5rem; object-fit:cover; border:2px solid var(--primary);" />
          <h3>${m.name}</h3>
          <p style="font-size:0.8rem; color:var(--primary); font-weight:600;">${m.designation}</p>
          <p class="text-muted" style="font-size:0.75rem; margin-bottom:0.75rem;">${m.company}</p>
          <button class="btn btn-sm btn-primary" onclick="showToast('Mentorship request dispatched to ${m.name}!', 'success')">Request Session</button>
        </div>
      `).join('')}
    </div>
  `;
}

let currentProfileAvatarBase64 = null;
let currentResumeFileName = null;

function renderStudentProfileSettings(container, s) {
  currentProfileAvatarBase64 = null;
  currentResumeFileName = s.resumeFileName || "rohit_patil_fullstack_cv.pdf";

  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Comprehensive Professional Profile & Dossier</h2>
        <p>Manage personal details, academic education, verified skills, career interests, resume, and profile photo.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="navToStudentView('passport')"><i class="fa-solid fa-id-card"></i> View Digital Passport</button>
    </div>

    <div class="card" style="max-width:850px; margin-bottom:2rem;">
      <form onsubmit="saveStudentProfileSettings(event)">
        <!-- 1. Avatar & DP Photo -->
        <div style="display:flex; align-items:center; gap:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:1.5rem; margin-bottom:1.5rem;">
          <div style="position:relative;">
            <img id="stuProfAvatarPreview" src="${s.avatarUrl}" onerror="handleAvatarError(this)" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid var(--primary); box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
          </div>
          <div>
            <h4 style="margin-bottom:0.25rem; font-size:1.05rem;"><i class="fa-solid fa-camera"></i> Profile Photo (Saved Permanently)</h4>
            <p class="text-muted" style="font-size:0.8rem; margin-bottom:0.6rem;">JPG, PNG, or WEBP up to 10MB. Automatically synced across industry dossiers.</p>
            <label class="btn btn-sm btn-outline" style="cursor:pointer; display:inline-block;">
              <i class="fa-solid fa-upload"></i> Choose New Photo
              <input type="file" accept="image/*" onchange="previewStudentProfileAvatar(event)" style="display:none;" />
            </label>
          </div>
        </div>

        <!-- 2. Personal Information -->
        <h4 style="color:var(--primary); margin-bottom:0.75rem;"><i class="fa-solid fa-user"></i> Personal Details</h4>
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input type="text" id="stuName" value="${s.fullName}" required /></div>
          <div class="form-group"><label>Official Phone Number</label><input type="tel" id="stuPhone" value="${s.phone || '+91 98234 56789'}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>District Location</label><input type="text" id="stuDistrict" value="${s.district}" required /></div>
          <div class="form-group"><label>State Jurisdiction</label><input type="text" id="stuState" value="${s.state || 'Maharashtra'}" required /></div>
        </div>
        <div class="form-group">
          <label>Professional Bio / Career Summary</label>
          <textarea id="stuBio" rows="2" required>${s.bio || ''}</textarea>
        </div>

        <!-- 3. Academic Education -->
        <h4 style="color:var(--primary); margin:1.25rem 0 0.75rem;"><i class="fa-solid fa-graduation-cap"></i> Academic Education</h4>
        <div class="form-row">
          <div class="form-group"><label>College / University</label><input type="text" id="stuCollege" value="${s.college || 'Lords Institute of Engineering & Technology'}" required /></div>
          <div class="form-group"><label>Degree / Branch</label><input type="text" id="stuCourse" value="${s.course || 'B.Tech Computer Science & Engineering'}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Year / Semester</label><input type="text" id="stuYearSem" value="${s.yearSemester || '4th Year / 8th Semester'}" required /></div>
          <div class="form-group"><label>Graduation Year</label><input type="text" id="stuGradYear" value="${s.graduationYear || '2026'}" required /></div>
          <div class="form-group"><label>CGPA / Grade</label><input type="text" id="stuCgpa" value="${s.cgpa || '8.85 / 10.0'}" required /></div>
        </div>

        <!-- 4. Resume / CV Management -->
        <h4 style="color:var(--primary); margin:1.25rem 0 0.75rem;"><i class="fa-solid fa-file-pdf"></i> Resume / Curriculum Vitae</h4>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-sm); padding:1rem; margin-bottom:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <div>
              <strong style="font-size:0.9rem; display:block;"><i class="fa-solid fa-paperclip"></i> Current Active Resume:</strong>
              <span class="badge-pill badge-employed" id="activeResumeBadge"><i class="fa-solid fa-file-pdf"></i> ${s.resumeFileName || 'rohit_patil_fullstack_cv.pdf'}</span>
            </div>
            <a href="${s.resumeUrl || '#'}" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> View / Download Resume
            </a>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem;">Upload Updated Resume (PDF or DOCX, max 10MB)</label>
            <input type="file" id="stuResumeFile" accept=".pdf,.doc,.docx" onchange="handleStudentResumeSelected(event)" />
          </div>
        </div>

        <!-- 5. Professional Social Profiles -->
        <h4 style="color:var(--primary); margin:1.25rem 0 0.75rem;"><i class="fa-solid fa-globe"></i> Professional Links</h4>
        <div class="form-row">
          <div class="form-group"><label><i class="fa-brands fa-linkedin text-primary"></i> LinkedIn Profile URL</label><input type="url" id="stuLinkedin" value="${s.linkedinUrl || ''}" required /></div>
          <div class="form-group"><label><i class="fa-brands fa-github"></i> GitHub Profile URL</label><input type="url" id="stuGithub" value="${s.githubUrl || ''}" required /></div>
        </div>

        <!-- 6. Career Interests & Preferred Roles -->
        <h4 style="color:var(--primary); margin:1.25rem 0 0.75rem;"><i class="fa-solid fa-bullseye"></i> Career Interests & Target Openings</h4>
        <div class="form-group">
          <label>Interests / Functional Domains (comma-separated)</label>
          <input type="text" id="stuInterests" value="${(s.interests || []).join(', ')}" required />
        </div>
        <div class="form-row">
          <div class="form-group"><label>Preferred Roles (comma-separated)</label><input type="text" id="stuPreferredRoles" value="${(s.preferredRoles || []).join(', ')}" required /></div>
          <div class="form-group"><label>Target Monthly Compensation</label><input type="text" id="stuSalaryExp" value="${s.salaryExpectation || '₹25,000 - ₹35,000 / month'}" required /></div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-floppy-disk"></i> Save Complete Professional Profile</button>
      </form>
    </div>
  `;
}

function previewStudentProfileAvatar(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    currentProfileAvatarBase64 = evt.target.result;
    const img = document.getElementById('stuProfAvatarPreview');
    if (img) img.src = currentProfileAvatarBase64;
    showToast("Profile avatar preview loaded. Click Save to persist.", "info");
  };
  reader.readAsDataURL(file);
}

function handleStudentResumeSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  currentResumeFileName = file.name;
  const badge = document.getElementById('activeResumeBadge');
  if (badge) badge.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${file.name} (Ready to Save)`;
  showToast(`Resume "${file.name}" selected. Click Save to persist.`, "info");
}

function saveStudentProfileSettings(e) {
  e.preventDefault();
  const s = window.SKT_STATE.student;

  s.fullName = document.getElementById('stuName').value.trim();
  s.phone = document.getElementById('stuPhone').value.trim();
  s.district = document.getElementById('stuDistrict').value.trim();
  s.state = document.getElementById('stuState').value.trim();
  s.bio = document.getElementById('stuBio').value.trim();

  s.college = document.getElementById('stuCollege').value.trim();
  s.course = document.getElementById('stuCourse').value.trim();
  s.yearSemester = document.getElementById('stuYearSem').value.trim();
  s.graduationYear = document.getElementById('stuGradYear').value.trim();
  s.cgpa = document.getElementById('stuCgpa').value.trim();

  s.linkedinUrl = document.getElementById('stuLinkedin').value.trim();
  s.githubUrl = document.getElementById('stuGithub').value.trim();

  s.interests = document.getElementById('stuInterests').value.split(',').map(i => i.trim());
  s.preferredRoles = document.getElementById('stuPreferredRoles').value.split(',').map(r => r.trim());
  s.salaryExpectation = document.getElementById('stuSalaryExp').value.trim();

  if (currentProfileAvatarBase64) {
    s.avatarUrl = currentProfileAvatarBase64;
    if (window.SKT_STATE.currentUser) {
      window.SKT_STATE.currentUser.avatar = currentProfileAvatarBase64;
    }
  }

  if (currentResumeFileName) {
    s.resumeFileName = currentResumeFileName;
    s.resumeUrl = `https://skilltrack.org/resumes/${currentResumeFileName}`;
  }

  window.saveLocalSktState();
  showToast("Professional profile updated successfully!", "success");
  navToStudentView('profile');
}

function renderStudentSkills(container, s) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>My Verified Technical Skills</h2><p>Accredited technical skills endorsed by state training institutions.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Skill Name</th><th>Proficiency Level</th><th>Verification Status</th></tr></thead>
          <tbody>
            ${(s.skills || []).map(sk => `
              <tr>
                <td><strong>${typeof sk === 'string' ? sk : sk.name}</strong></td>
                <td>${sk.level || 'Intermediate'}</td>
                <td><span class="badge-pill ${sk.verified ? 'badge-employed' : 'warning'}">${sk.verified ? 'Verified by MSSDS' : 'Self-Reported'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStudentTraining(container, s) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Accredited Institutional Trainings</h2><p>Official course completions registered by accredited centers.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Course Title</th><th>Institute</th><th>Duration</th><th>Completed Date</th><th>Grade</th><th>Status</th></tr></thead>
          <tbody>
            ${(s.trainings || []).map(t => `
              <tr>
                <td><strong>${t.title}</strong></td>
                <td>${t.instituteName}</td>
                <td>${t.duration}</td>
                <td>${t.completedDate}</td>
                <td><strong class="highlight-blue">${t.grade}</strong></td>
                <td><span class="badge-employed">${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStudentCertificates(container, s) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Digital Credentials Ledger</h2><p>Cryptographically verifiable government certificates.</p></div></div>
    <div class="features-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${(s.certificates || []).map(c => `
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-certificate"></i></div>
          <h3>${c.title}</h3>
          <p><strong>Issuer:</strong> ${c.issuer}<br><strong>Date:</strong> ${c.issueDate}<br><strong>Credential ID:</strong> <code>${c.credentialId}</code></p>
          <button class="btn btn-outline btn-sm" style="margin-top:0.75rem;" onclick="alert('Credential ${c.credentialId} verified via MSSDS state registry!');"><i class="fa-solid fa-shield-check"></i> Verify Credential</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStudentProjects(container, s) {
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Portfolio Projects (Building & Selling)</h2>
        <p>Software applications engineered during training with verified source deliverables and system benchmarks.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="promptAddProjectModal()"><i class="fa-solid fa-plus"></i> Add Project to Portfolio</button>
    </div>
    <div class="grid-2col-even">
      ${(s.projects || []).map(p => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h3 style="font-size:1.1rem; font-weight:800;">${p.title}</h3>
            <span class="badge-pill badge-employed"><i class="fa-solid fa-shield-check"></i> Verified Project</span>
          </div>
          <p class="text-muted" style="margin:0.5rem 0; font-size:0.85rem;">${p.description}</p>
          <div style="margin-bottom:0.75rem;">
            ${(p.tech || []).map(t => `<span class="badge-pill info" style="font-size:0.7rem; margin-right:0.25rem;">${t}</span>`).join('')}
          </div>
          <div style="display:flex; gap:0.5rem; border-top:1px solid #f1f5f9; padding-top:0.75rem;">
            ${p.github ? `<a href="${p.github}" target="_blank" class="btn btn-outline btn-sm"><i class="fa-brands fa-github"></i> GitHub Source</a>` : ''}
            <button class="btn btn-primary btn-sm" onclick="viewProjectDeliverables(${p.id})"><i class="fa-solid fa-laptop-file"></i> View Project Deliverable</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function promptAddProjectModal() {
  const html = `
    <form onsubmit="submitNewPortfolioProject(event)">
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" id="ppTitle" placeholder="e.g. Distributed Telemetry Daemon" required />
      </div>
      <div class="form-group">
        <label>Technologies Used (comma-separated)</label>
        <input type="text" id="ppTech" placeholder="e.g. Node.js, Docker, AWS Cloud, MySQL" required />
      </div>
      <div class="form-group">
        <label>GitHub Repository URL</label>
        <input type="url" id="ppGithub" value="https://github.com/rohit-patil-dev" required />
      </div>
      <div class="form-group">
        <label>Project Summary & Architecture</label>
        <textarea id="ppDesc" rows="2" placeholder="Describe the application architecture, problem solved, and latency..." required></textarea>
      </div>
      <div class="form-group">
        <label>Deliverable Specifications & Performance Benchmarks</label>
        <input type="text" id="ppSpecs" value="Sub-45ms latency, verified automated unit tests, 99.9% uptime." required />
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:1rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Add to Portfolio</button>
    </form>
  `;
  openSharedModal("Add Verified Project to Portfolio", html);
}

function submitNewPortfolioProject(e) {
  e.preventDefault();
  const projData = {
    title: document.getElementById('ppTitle').value.trim(),
    tech: document.getElementById('ppTech').value.split(',').map(t => t.trim()),
    github: document.getElementById('ppGithub').value.trim(),
    description: document.getElementById('ppDesc').value.trim(),
    deliverableSpecs: document.getElementById('ppSpecs').value.trim()
  };
  window.addStudentProject(projData);
  closeSharedModal();
}

function viewProjectDeliverables(projId) {
  const p = (window.SKT_STATE.student.projects || []).find(pr => pr.id === Number(projId));
  if (!p) return;

  const html = `
    <div style="padding:0.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
        <div>
          <span class="badge-pill badge-employed" style="font-size:0.75rem; margin-bottom:0.35rem;"><i class="fa-solid fa-check"></i> ACCREDITED CAPSTONE PROJECT</span>
          <h3 style="font-size:1.3rem; font-weight:800;">${p.title}</h3>
        </div>
        <a href="${p.github}" target="_blank" class="btn btn-sm btn-outline"><i class="fa-brands fa-github"></i> Repository</a>
      </div>

      <p style="font-size:0.9rem; color:#475569; line-height:1.6; margin-bottom:1.25rem;">${p.description}</p>

      <div style="background:#f8fafc; padding:1rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0; margin-bottom:1.25rem;">
        <h4 style="color:var(--primary); font-size:0.9rem; margin-bottom:0.5rem;"><i class="fa-solid fa-microchip"></i> System Architecture & Technology Stack</h4>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.75rem;">
          ${(p.tech || []).map(t => `<span class="badge-pill info">${t}</span>`).join('')}
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.8rem; color:#334155; margin-top:0.5rem; border-top:1px solid #e2e8f0; padding-top:0.75rem;">
          <div><strong>Production Verification:</strong> Confirmed by GBIT Pune</div>
          <div><strong>Code Quality Score:</strong> 96/100 (Clean Architecture)</div>
          <div><strong>Database Queries:</strong> 14,000 requests/day</div>
          <div><strong>Benchmark Latency:</strong> 42ms median response</div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
        <button class="btn btn-secondary" onclick="closeSharedModal()">Close Deliverable</button>
      </div>
    </div>
  `;
  openSharedModal(`Deliverable Specs: ${p.title}`, html);
}

function renderStudentLearningPlan(container, s) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Personalized 4-Week Career Learning Roadmap</h2><p>Step-by-step curriculum to bridge technical gaps.</p></div></div>
    <div class="timeline-stepper">
      <div class="step-card"><div class="step-badge">W1</div><div class="step-desc"><h4>Microservices Architecture</h4><p>Deploy containerized Express services to ECS</p></div></div>
      <div class="step-card"><div class="step-badge">W2</div><div class="step-desc"><h4>Terraform & IaC</h4><p>Write reusable modules for VPC, Subnets and RDS</p></div></div>
      <div class="step-card"><div class="step-badge">W3</div><div class="step-desc"><h4>CI/CD Deployment Pipelines</h4><p>Configure GitHub Actions workflow for zero-downtime</p></div></div>
      <div class="step-card"><div class="step-badge">W4</div><div class="step-desc"><h4>Distributed Telemetry</h4><p>Implement Prometheus scraping and Grafana alerts</p></div></div>
    </div>
  `;
}
