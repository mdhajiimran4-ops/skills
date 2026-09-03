// app.js - Master Navigation, Strict RBAC Authentication & Role Redirection
const DEFAULT_AVATAR_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%231d4ed8'/><text x='50%' y='55%' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='32px' dy='.3em'>ST</text></svg>";

document.addEventListener('DOMContentLoaded', () => {
  initSession();
});

window.addEventListener('hashchange', () => {
  const user = window.SKT_STATE.currentUser;
  if (user) {
    parseInitialRoute(user);
  } else {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('public/')) {
      const section = hash.split('/')[1] || 'home';
      navToPublic(section);
    } else {
      navToPublic('home');
    }
  }
});

function handleAvatarError(img) {
  img.onerror = null;
  img.src = DEFAULT_AVATAR_FALLBACK;
}

// 1. Session Initialization
function initSession() {
  const saved = localStorage.getItem('skt_session_user');
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user && user.role) {
        window.SKT_STATE.currentUser = user;
        applyAuthenticatedNavbar(user);
        parseInitialRoute(user);
        return;
      }
    } catch (e) {
      console.error('Session load error:', e);
      localStorage.removeItem('skt_session_user');
    }
  }

  // Not logged in: Default to Public Front Page
  window.SKT_STATE.currentUser = null;
  applyPublicNavbar();
  navToPublic('home');
}

function handleBrandClick() {
  const user = window.SKT_STATE.currentUser;
  if (user) {
    navToMyDashboard();
  } else {
    navToPublic('home');
  }
}

// 2. Public Front Page Navigation
function navToPublic(section) {
  // Hide all screens
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const pubScreen = document.getElementById('screen-public');
  if (pubScreen) pubScreen.style.display = 'block';

  // Update public nav links
  document.querySelectorAll('#publicNavLinks .nav-item').forEach(b => b.classList.remove('active'));
  const activeTab = document.getElementById(`pnav-${section}`);
  if (activeTab) activeTab.classList.add('active');

  // Toggle public section
  document.querySelectorAll('.public-section').forEach(sec => sec.style.display = 'none');
  const targetSec = document.getElementById(`pview-${section}`);
  if (targetSec) targetSec.style.display = 'block';

  window.location.hash = `public/${section}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Navbar State Management (Strict Public vs Authenticated Separation)
function applyPublicNavbar() {
  document.getElementById('publicNavLinks').style.display = 'flex';
  document.getElementById('publicAuthButtons').style.display = 'flex';
  document.getElementById('authRoleNavLinks').style.display = 'none';
  document.getElementById('authenticatedUserControls').style.display = 'none';
  document.getElementById('navRoleBadge').style.display = 'none';
}

function applyAuthenticatedNavbar(user) {
  document.getElementById('publicNavLinks').style.display = 'none';
  document.getElementById('publicAuthButtons').style.display = 'none';
  document.getElementById('authRoleNavLinks').style.display = 'flex';
  document.getElementById('authenticatedUserControls').style.display = 'flex';

  const roleBadge = document.getElementById('navRoleBadge');
  roleBadge.style.display = 'inline-block';
  if (user.role === 'student') {
    roleBadge.textContent = `STUDENT (${user.studentId || 'SKP-MH'})`;
  } else if (user.role === 'faculty') {
    roleBadge.textContent = `FACULTY (${user.facultyId || 'FAC-101'})`;
  } else {
    roleBadge.textContent = `${user.role.toUpperCase()} PORTAL`;
  }

  const topName = document.getElementById('topNavUserName');
  const topRole = document.getElementById('topNavUserRole');
  const topAvatar = document.getElementById('topNavAvatar');

  if (topName) topName.textContent = user.name;
  if (topRole) topRole.textContent = user.role.toUpperCase();
  if (topAvatar && user.avatar) topAvatar.src = user.avatar;
}

// 4. Role-Based Redirection & Routing
function navToMyDashboard() {
  const user = window.SKT_STATE.currentUser;
  if (!user) {
    openAuthModal('login');
    return;
  }
  switch (user.role) {
    case 'student': navToStudentView('dashboard'); break;
    case 'faculty': navToFacultyView('dashboard'); break;
    case 'industry': navToIndustryView('dashboard'); break;
    case 'employee': navToEmployeeView('dashboard'); break;
    case 'government': navToGovernmentView('dashboard'); break;
    case 'admin': navToAdminView('dashboard'); break;
    default: navToPublic('home');
  }
}

function navToMyProfileSettings() {
  const user = window.SKT_STATE.currentUser;
  if (!user) {
    openAuthModal('login');
    return;
  }
  switch (user.role) {
    case 'student': navToStudentView('profile'); break;
    case 'faculty': navToFacultyView('profile'); break;
    case 'industry': navToIndustryView('profile'); break;
    case 'employee': navToEmployeeView('profile'); break;
    case 'government': navToGovernmentView('profile'); break;
    case 'admin': navToAdminView('profile'); break;
    default: navToPublic('home');
  }
}

function parseInitialRoute(user) {
  const hash = window.location.hash.replace('#', '');
  if (!hash || hash.startsWith('public/')) {
    navToMyDashboard();
    return;
  }
  const parts = hash.split('/');
  const role = parts[0];
  const subView = parts[1] || 'dashboard';

  // Strict RBAC Verification
  if (role !== user.role) {
    showToast(`Access Denied: You cannot view ${role.toUpperCase()} dashboard.`, 'error');
    navToMyDashboard();
    return;
  }

  switch (role) {
    case 'student': navToStudentView(subView, parts[2]); break;
    case 'faculty': navToFacultyView(subView); break;
    case 'industry': navToIndustryView(subView); break;
    case 'employee': navToEmployeeView(subView); break;
    case 'government': navToGovernmentView(subView); break;
    case 'admin': navToAdminView(subView); break;
    default: navToMyDashboard();
  }
}

// 5. Auth Modal & Dynamic Multi-Role Registration
let currentAuthMode = 'login';
let currentRegAvatarBase64 = null;

function openAuthModal(mode) {
  currentAuthMode = mode || 'login';
  switchModalAuthTab(currentAuthMode);
  document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function switchModalAuthTab(mode) {
  currentAuthMode = mode;
  const tLogin = document.getElementById('modalAuthTabLogin');
  const tReg = document.getElementById('modalAuthTabRegister');
  const regFields = document.getElementById('modalRegisterFields');
  const avatarSec = document.getElementById('modalAvatarUploadSection');
  const confirmGrp = document.getElementById('confirmPassGroup');
  const btn = document.getElementById('mAuthSubmitBtn');
  const head = document.getElementById('authModalHeader');
  const currentRole = document.getElementById('mAuthRole').value;

  if (mode === 'register') {
    tLogin.classList.remove('active');
    tReg.classList.add('active');
    if (regFields) regFields.style.display = 'block';
    if (avatarSec) avatarSec.style.display = 'block';
    if (confirmGrp) confirmGrp.style.display = 'block';
    btn.innerHTML = `<i class="fa-solid fa-user-check"></i> Register Account & Enter Portal`;
    head.textContent = "Register Industrial & Academic Account";
    handleAuthRoleChange(currentRole);
  } else {
    tReg.classList.remove('active');
    tLogin.classList.add('active');
    if (regFields) regFields.style.display = 'none';
    if (avatarSec) avatarSec.style.display = 'none';
    if (confirmGrp) confirmGrp.style.display = 'none';
    btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Sign In to Dashboard`;
    head.textContent = "Sign In to SKILLTRACK";
    autoFillRoleDemoEmail(currentRole);
  }
}

function handleAuthRoleChange(role) {
  // Hide all role-specific registration containers
  const stuFields = document.getElementById('regFieldsStudent');
  const indFields = document.getElementById('regFieldsIndustry');
  const menFields = document.getElementById('regFieldsMentor');
  const govFields = document.getElementById('regFieldsGov');

  if (stuFields) stuFields.style.display = 'none';
  if (indFields) indFields.style.display = 'none';
  if (menFields) menFields.style.display = 'none';
  if (govFields) govFields.style.display = 'none';

  if (role === 'student' && stuFields) stuFields.style.display = 'block';
  else if (role === 'industry' && indFields) indFields.style.display = 'block';
  else if (role === 'employee' && menFields) menFields.style.display = 'block';
  else if (role === 'government' && govFields) govFields.style.display = 'block';

  if (currentAuthMode === 'login') {
    autoFillRoleDemoEmail(role);
  }
}

function autoFillRoleDemoEmail(role) {
  const emailInp = document.getElementById('mAuthEmail');
  if (!emailInp) return;
  if (role === 'student') emailInp.value = "rohit.patil@skilltrack.org";
  else if (role === 'faculty') emailInp.value = "arvind.joshi@faculty.skilltrack.org";
  else if (role === 'industry') emailInp.value = "contact@techsolutions.com";
  else if (role === 'employee') emailInp.value = "vikram.malhotra@techsolutions.com";
  else if (role === 'government') emailInp.value = "officer@skilltrack.gov";
  else if (role === 'admin') emailInp.value = "admin@skilltrack.org";
}

function previewRegAvatar(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentRegAvatarBase64 = e.target.result;
    const previewImg = document.getElementById('regAvatarPreview');
    if (previewImg) previewImg.src = currentRegAvatarBase64;
    showToast("Profile DP selected! Will be permanently stored with your account.", "info");
  };
  reader.readAsDataURL(file);
}

function toggleModalPassword(fieldId = 'mAuthPassword') {
  const p = document.getElementById(fieldId);
  if (p) p.type = p.type === 'password' ? 'text' : 'password';
}

function handleModalAuthSubmit(e) {
  e.preventDefault();
  const role = document.getElementById('mAuthRole').value;
  const email = document.getElementById('mAuthEmail').value.trim();
  const password = document.getElementById('mAuthPassword').value;

  if (currentAuthMode === 'register') {
    const passConfirm = document.getElementById('mAuthPasswordConfirm').value;
    if (password !== passConfirm) {
      showToast("Passwords do not match. Please verify.", "error");
      return;
    }

    // Default avatars per role if none uploaded
    const defaultAvatars = {
      student: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      faculty: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      industry: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
      employee: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      government: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      admin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"
    };

    const permanentAvatar = currentRegAvatarBase64 || defaultAvatars[role] || DEFAULT_AVATAR_FALLBACK;

    // Collect role-specific details
    let userSession = {
      id: Date.now(),
      role,
      email,
      avatar: permanentAvatar
    };

    if (role === 'student') {
      const stuName = (document.getElementById('regStuName').value || "New Student").trim();
      const newStudentId = `SKP-MH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const newStudent = {
        id: Date.now(),
        userId: Date.now(),
        digitalSkillPassportId: newStudentId,
        facultyId: "FAC-101",
        facultyName: "Prof. Arvind Joshi",
        attendanceRate: "100%",
        fullName: stuName,
        email: email,
        phone: (document.getElementById('regStuPhone').value || "+91 98234 00000").trim(),
        college: (document.getElementById('regStuCollege').value || "Government Polytechnic (GBIT), Pune").trim(),
        course: (document.getElementById('regStuCourse').value || "B.Tech Computer Science").trim(),
        yearSemester: (document.getElementById('regStuYear').value || "1st Year / 1st Sem").trim(),
        district: (document.getElementById('regStuDistrict').value || "Pune").trim(),
        state: "Maharashtra",
        avatarUrl: permanentAvatar,
        bio: "Enrolled in state skilling and employment transition programme.",
        resumeUrl: (document.getElementById('regStuResume').value || "https://skilltrack.org/resumes/default_cv.pdf").trim(),
        resumeFileName: "student_resume.pdf",
        linkedinUrl: (document.getElementById('regStuLinkedin').value || "").trim(),
        githubUrl: (document.getElementById('regStuGithub').value || "").trim(),
        interests: ["Software Engineering", "Cloud Computing"],
        preferredRoles: ["Trainee Software Engineer"],
        preferredLocation: "Maharashtra",
        salaryExpectation: "₹25,000 / month",
        employmentStatus: "unemployed",
        unemploymentReason: "Completed training, actively seeking placement",
        skills: [
          { name: "Computer Fundamentals", level: "Intermediate", verified: true, endorsedBy: "Prof. Arvind Joshi (FAC-101)" }
        ],
        trainings: [],
        certificates: [],
        projects: [],
        followUps: []
      };

      const skillsStr = document.getElementById('regStuSkills').value;
      if (skillsStr && skillsStr.trim()) {
        newStudent.skills = skillsStr.split(',').map(sk => ({ name: sk.trim(), level: "Intermediate", verified: true, endorsedBy: "State Skilling Board" }));
      }

      if (!window.SKT_STATE.students) window.SKT_STATE.students = [];
      window.SKT_STATE.students.push(newStudent);
      window.SKT_STATE.currentStudentId = newStudent.id;
      window.SKT_STATE.student = newStudent;

      const f = (window.SKT_STATE.faculty || []).find(fac => fac.facultyId === "FAC-101");
      if (f && !f.assignedStudentIds.includes(newStudent.id)) {
        f.assignedStudentIds.push(newStudent.id);
      }

      userSession.name = newStudent.fullName;
      userSession.studentId = newStudent.digitalSkillPassportId;
      userSession.id = newStudent.id;
    } else if (role === 'faculty') {
      const newFacultyId = `FAC-${Math.floor(100 + Math.random() * 900)}`;
      const newFaculty = {
        id: Date.now(),
        facultyId: newFacultyId,
        name: "Prof. Academic Mentor",
        email: email,
        phone: "+91 98220 00000",
        department: "Computer Science & Engineering",
        designation: "Assistant Professor",
        office: "Faculty Cabin 201",
        avatarUrl: permanentAvatar,
        assignedStudentIds: [],
        coursesManaged: [],
        officeHours: "Mon-Fri 2:00 PM - 4:00 PM"
      };
      if (!window.SKT_STATE.faculty) window.SKT_STATE.faculty = [];
      window.SKT_STATE.faculty.push(newFaculty);
      window.SKT_STATE.currentFacultyId = newFaculty.facultyId;
      userSession.name = newFaculty.name;
      userSession.facultyId = newFaculty.facultyId;
      userSession.id = newFaculty.id;
    } else if (role === 'industry') {
      const ind = window.SKT_STATE.industry;
      ind.companyName = (document.getElementById('regIndName').value || "Tech Solutions Pvt. Ltd.").trim();
      ind.contactEmail = email;
      ind.contactPhone = (document.getElementById('regIndPhone').value || "+91 20 6712 3400").trim();
      ind.industryType = (document.getElementById('regIndType').value || "Information Technology").trim();
      ind.district = (document.getElementById('regIndDistrict').value || "Pune").trim();
      ind.website = (document.getElementById('regIndWebsite').value || "https://company.com").trim();
      ind.companyDescription = (document.getElementById('regIndOverview').value || ind.companyDescription).trim();
      ind.logoUrl = permanentAvatar;

      userSession.name = ind.companyName;
    } else if (role === 'employee') {
      const emp = window.SKT_STATE.employee;
      emp.name = (document.getElementById('regMenName').value || "Vikram Malhotra").trim();
      emp.email = email;
      emp.phone = (document.getElementById('regMenPhone').value || "+91 98450 12345").trim();
      emp.organization = (document.getElementById('regMenOrg').value || "Tech Solutions Pvt. Ltd.").trim();
      emp.designation = (document.getElementById('regMenRole').value || "Senior Cloud & Data Architect").trim();
      emp.linkedinUrl = (document.getElementById('regMenLinkedin').value || emp.linkedinUrl).trim();
      emp.professionalDetails = (document.getElementById('regMenTopics').value || emp.professionalDetails).trim();
      emp.avatarUrl = permanentAvatar;

      userSession.name = emp.name;
    } else if (role === 'government') {
      const gov = window.SKT_STATE.government;
      gov.name = (document.getElementById('regGovName').value || "Dr. Rajesh Deshmukh").trim();
      gov.officialEmail = email;
      gov.officialPhone = (document.getElementById('regGovPhone').value || "+91 22 2202 4589").trim();
      gov.department = (document.getElementById('regGovDept').value || gov.department).trim();
      gov.designation = (document.getElementById('regGovDesignation').value || gov.designation).trim();
      gov.assignedDistrict = (document.getElementById('regGovDistrict').value || gov.assignedDistrict).trim();
      gov.employeeId = (document.getElementById('regGovEmpId').value || gov.employeeId).trim();

      userSession.name = gov.name;
    } else {
      userSession.name = "Master Administrator";
    }

    // Persist permanently
    window.SKT_STATE.currentUser = userSession;
    localStorage.setItem('skt_session_user', JSON.stringify(userSession));
    if (window.saveLocalSktState) window.saveLocalSktState();

    closeAuthModal();
    applyAuthenticatedNavbar(userSession);
    showToast(`Account registered successfully! Welcome, ${userSession.name}.`, "success");
    navToMyDashboard();
    return;
  }

  // LOGIN FLOW
  let userSession = { role, email };
  if (role === 'student') {
    const students = window.SKT_STATE.students || [];
    const s = students.find(st => st.email && st.email.toLowerCase() === email.toLowerCase()) 
      || students.find(st => st.digitalSkillPassportId && st.digitalSkillPassportId.toLowerCase() === email.toLowerCase())
      || (students.length > 0 ? students[0] : null) 
      || window.SKT_STATE.student
      || { fullName: "Rohit Patil", avatarUrl: DEFAULT_AVATAR_FALLBACK, id: 1, digitalSkillPassportId: "SKP-MH-2024-008912" };
    window.SKT_STATE.currentStudentId = s.id || 1;
    window.SKT_STATE.student = s;
    userSession.name = s.fullName || "Student Candidate";
    userSession.avatar = s.avatarUrl || DEFAULT_AVATAR_FALLBACK;
    userSession.id = s.id || 1;
    userSession.studentId = s.digitalSkillPassportId || "SKP-MH-2024-008912";
  } else if (role === 'faculty') {
    const facultyList = window.SKT_STATE.faculty || [];
    const fac = facultyList.find(f => f.email && f.email.toLowerCase() === email.toLowerCase())
      || facultyList.find(f => f.facultyId && f.facultyId.toLowerCase() === email.toLowerCase())
      || (facultyList.length > 0 ? facultyList[0] : null)
      || { facultyId: "FAC-101", name: "Prof. Arvind Joshi", avatarUrl: DEFAULT_AVATAR_FALLBACK, id: 1 };
    window.SKT_STATE.currentFacultyId = fac.facultyId || "FAC-101";
    userSession.name = fac.name || "Prof. Academic Mentor";
    userSession.avatar = fac.avatarUrl || DEFAULT_AVATAR_FALLBACK;
    userSession.id = fac.id || 1;
    userSession.facultyId = fac.facultyId || "FAC-101";
  } else if (role === 'industry') {
    const companies = window.SKT_STATE.companies || [];
    const comp = companies.find(c => c.contactEmail && c.contactEmail.toLowerCase() === email.toLowerCase()) 
      || (companies.length > 0 ? companies[0] : null)
      || window.SKT_STATE.industry
      || { id: 1, companyName: "Tech Solutions Pvt. Ltd.", logoUrl: DEFAULT_AVATAR_FALLBACK };
    window.SKT_STATE.currentCompanyId = comp.id || 1;
    userSession.companyId = comp.id || 1;
    userSession.name = comp.name || comp.companyName || "Industry Partner";
    userSession.avatar = comp.logo || comp.logoUrl || DEFAULT_AVATAR_FALLBACK;
    userSession.id = comp.id || 1;
  } else if (role === 'employee') {
    const emp = window.SKT_STATE.employee || { name: "Vikram Malhotra", avatarUrl: DEFAULT_AVATAR_FALLBACK, id: 1 };
    userSession.name = emp.name || "Employee Mentor";
    userSession.avatar = emp.avatarUrl || DEFAULT_AVATAR_FALLBACK;
    userSession.id = emp.id || 1;
  } else if (role === 'government') {
    const gov = window.SKT_STATE.government || { name: "Dr. Rajesh Deshmukh", id: 1 };
    userSession.name = gov.name || "State Skilling Officer";
    userSession.avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
    userSession.id = gov.id || 1;
  } else if (role === 'admin') {
    const adm = window.SKT_STATE.admin || { name: "Master Administrator", id: 1 };
    userSession.name = adm.name || "Master Administrator";
    userSession.avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200";
    userSession.id = adm.id || 1;
  }

  window.SKT_STATE.currentUser = userSession;
  localStorage.setItem('skt_session_user', JSON.stringify(userSession));

  closeAuthModal();
  applyAuthenticatedNavbar(userSession);
  showToast(`Welcome back, ${userSession.name}!`, "success");
  navToMyDashboard();
}

function logoutSession() {
  localStorage.removeItem('skt_session_user');
  window.SKT_STATE.currentUser = null;
  applyPublicNavbar();
  navToPublic('home');
  showToast('You have been signed out.', 'info');
}

// 6. Global Profile Picture / Logo Upload with Base64 & Local Persistence
function triggerAvatarPicker() {
  const inp = document.getElementById('globalAvatarFileInput');
  if (inp) inp.click();
}

function handleGlobalAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Url = e.target.result;
    const user = window.SKT_STATE.currentUser;
    if (!user) return;

    // Update session
    user.avatar = base64Url;
    localStorage.setItem('skt_session_user', JSON.stringify(user));

    // Update navbar avatar
    const topNavAvatar = document.getElementById('topNavAvatar');
    if (topNavAvatar) topNavAvatar.src = base64Url;

    // Update role specific data
    if (user.role === 'student') {
      window.SKT_STATE.student.avatarUrl = base64Url;
      const img = document.getElementById('studentProfileImg');
      if (img) img.src = base64Url;
    } else if (user.role === 'industry') {
      window.SKT_STATE.industry.logoUrl = base64Url;
      const img = document.getElementById('industryLogoImg');
      if (img) img.src = base64Url;
    } else if (user.role === 'employee') {
      window.SKT_STATE.employee.avatarUrl = base64Url;
      const img = document.getElementById('employeeAvatarImg');
      if (img) img.src = base64Url;
    }

    if (window.saveLocalSktState) window.saveLocalSktState();
    showToast('Profile photo updated successfully!', 'success');
  };
  reader.readAsDataURL(file);
}

// 7. Contact Form Handler
function handlePublicContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  showToast(`Thank you, ${name}! Your query has been logged with the state skilling cell.`, 'success');
  e.target.reset();
}

// 8. Shared Helpers
function openSharedModal(title, html) {
  document.getElementById('sharedModalTitle').textContent = title;
  document.getElementById('sharedModalBody').innerHTML = html;
  document.getElementById('sharedModal').classList.add('active');
}

function closeSharedModal() {
  document.getElementById('sharedModal').classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Global window bindings to guarantee inline HTML onclick accessibility
window.navToPublic = navToPublic;
window.handleBrandClick = handleBrandClick;
window.navToMyDashboard = navToMyDashboard;
window.navToMyProfileSettings = navToMyProfileSettings;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchModalAuthTab = switchModalAuthTab;
window.handleAuthRoleChange = handleAuthRoleChange;
window.toggleModalPassword = toggleModalPassword;
window.handleModalAuthSubmit = handleModalAuthSubmit;
window.logoutSession = logoutSession;
window.triggerAvatarPicker = triggerAvatarPicker;
window.handleGlobalAvatarUpload = handleGlobalAvatarUpload;
window.previewRegAvatar = previewRegAvatar;
window.handlePublicContactSubmit = handlePublicContactSubmit;
window.openSharedModal = openSharedModal;
window.closeSharedModal = closeSharedModal;
window.showToast = showToast;
