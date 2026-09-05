/* ==========================================================================
   SkillBridge shared frontend utilities
   ========================================================================== */

const API_BASE = '/api';

function getToken() { return localStorage.getItem('sb_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('sb_user') || 'null'); }
  catch { return null; }
}
function setSession(token, user) {
  localStorage.setItem('sb_token', token);
  localStorage.setItem('sb_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
}
function getDashboardForRole(role) {
  const r = (role || '').toLowerCase().trim();
  if (r === 'industry' || r === 'employer' || r === 'employee') return '/industry.html';
  if (r === 'institute') return '/institute.html';
  if (r === 'government') return '/government.html';
  if (r === 'investor') return '/investor.html';
  return '/student.html';
}

function requireLogin(expectedRole) {
  const user = getUser();
  const token = getToken();
  if (!user || !token) {
    window.__sb_redirecting = true;
    window.location.replace('/login.html');
    return null;
  }
  if (user.role === 'admin') {
    return user;
  }
  if (expectedRole) {
    // Government and Investor oversight portals are publicly inspectable by any authenticated role
    if (expectedRole === 'government' || expectedRole === 'investor') {
      return user;
    }
    const isCompanyPortal = (expectedRole === 'industry' || expectedRole === 'employer' || expectedRole === 'employee') &&
                            (user.role === 'industry' || user.role === 'employer' || user.role === 'employee');
    if (user.role !== expectedRole && !isCompanyPortal) {
      window.__sb_redirecting = true;
      const target = getDashboardForRole(user.role);
      window.location.replace(target);
      return null;
    }
  }
  return user;
}
function logout() { clearSession(); window.location.href = '/index.html'; }

async function api(path, { method = 'GET', body } = {}) {
  if (window.__sb_redirecting) {
    return {};
  }
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = {};
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    if (res.status === 403) {
      console.warn(`[Access Info] ${path}:`, data.error);
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function toast(message, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function scoreColor(score) {
  if (score >= 75) return 'pill-good';
  if (score >= 45) return 'pill-signal';
  return 'pill-bad';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(name) {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderAvatar(name, avatarUrl, size = 40) {
  const initials = getInitials(name);
  let pixelSize = 40;
  if (typeof size === 'number' && !isNaN(size)) {
    pixelSize = Math.round(size);
  } else if (typeof size === 'string') {
    if (size.includes('xl')) pixelSize = 100;
    else if (size.includes('lg')) pixelSize = 80;
    else if (size.includes('md')) pixelSize = 48;
    else if (size.includes('sm')) pixelSize = 32;
    else {
      const parsed = parseInt(size, 10);
      pixelSize = isNaN(parsed) ? 40 : parsed;
    }
  }

  const commonStyle = `width:${pixelSize}px;height:${pixelSize}px;min-width:${pixelSize}px;min-height:${pixelSize}px;max-width:${pixelSize}px;max-height:${pixelSize}px;aspect-ratio:1/1;border-radius:50%;object-fit:cover;object-position:center top;display:inline-block;vertical-align:middle;box-sizing:border-box;`;

  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim()) {
    const cleanUrl = avatarUrl.trim();
    return `<img src="${escapeHtml(cleanUrl)}" alt="${escapeHtml(name || 'User')}" class="avatar-img avatar-passport-photo" style="${commonStyle}border:2px solid #E2E8F0;box-shadow:0 2px 6px rgba(15,23,42,0.1);" onerror="this.outerHTML='<span class=\\'avatar-initials\\' style=\\'${commonStyle}background:var(--slate-deep);color:#fff;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.max(11, Math.round(pixelSize*0.38))}px;box-shadow:0 2px 6px rgba(15,23,42,0.1);\\'>${initials}</span>'">`;
  }
  return `<span class="avatar-initials" style="${commonStyle}background:var(--slate-deep);color:#fff;font-weight:700;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.max(11, Math.round(pixelSize*0.38))}px;box-shadow:0 2px 6px rgba(15,23,42,0.1);">${initials}</span>`;
}

// Modern Vector SVG SkillTrack Brand Logo Generator
function getSkillTrackLogoHtml(options = {}) {
  const size = options.size || 34;
  const showText = options.showText !== false;
  const subtitle = options.subtitle || 'Skills & Workforce Intelligence';
  const isLight = options.theme === 'light';
  const textColor = isLight ? '#FFFFFF' : 'var(--slate-deep, #16233A)';
  const subColor = isLight ? '#94A3B8' : '#64748B';

  return `
    <div class="brand-logo-wrap" style="display:inline-flex;align-items:center;gap:11px;text-decoration:none;">
      <svg class="brand-svg-mark" width="${size}" height="${size}" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;filter:drop-shadow(0 2px 5px rgba(15,23,42,0.18));">
        <defs>
          <linearGradient id="st_grad_bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1E293B"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
          <linearGradient id="st_grad_amber" x1="6" y1="10" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FCD34D"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
          <linearGradient id="st_grad_blue" x1="12" y1="20" x2="32" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#2563EB"/>
          </linearGradient>
        </defs>
        <!-- Dark Shield Container -->
        <rect width="44" height="44" rx="10" fill="url(#st_grad_bg)"/>
        <rect x="1" y="1" width="42" height="42" rx="9" stroke="rgba(255,255,255,0.12)" stroke-width="1.2"/>
        
        <!-- Graduation Mortarboard Peak -->
        <polygon points="22,9 35,16 22,23 9,16" fill="url(#st_grad_amber)"/>
        <polygon points="22,11 31,16 22,21 13,16" fill="#FFF" opacity="0.25"/>
        
        <!-- Graduation Cap Tassel -->
        <path d="M33 16.5 L36 21.5 L36 25" stroke="#FDE68A" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="36" cy="25.5" r="1.3" fill="#F59E0B"/>
        
        <!-- Connecting Skill Bridge Arch & Trusses -->
        <path d="M12 33 C14 26, 20 23.5, 22 23.5 C24 23.5, 30 26, 32 33" stroke="url(#st_grad_blue)" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M16 33 L16 29.5 M22 33 L22 27.5 M28 33 L28 29.5" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
        
        <!-- Central Progress Nexus Node -->
        <circle cx="22" cy="23.5" r="2.8" fill="#FFF" stroke="#2563EB" stroke-width="1.5"/>
        <circle cx="22" cy="23.5" r="1.2" fill="#F59E0B"/>
      </svg>
      ${showText ? `
        <div style="display:flex;flex-direction:column;line-height:1.15;text-align:left;">
          <span class="brand-text-title" style="font-family:var(--font-display, 'Fraunces', serif);font-weight:700;font-size:1.24rem;color:${textColor};letter-spacing:-0.02em;">Skill<span style="color:#D97706;">Track</span></span>
          <span class="brand-text-sub" style="font-size:0.68rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${subColor};">${escapeHtml(subtitle)}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// Official Education & Governance Partner Logos Generator (MSBTE, AICTE, Skill India, NCVET)
function getEducationLogosHtml(options = {}) {
  const compact = options.compact || false;
  return `
    <div class="edu-partner-strip ${compact ? 'edu-partner-compact' : ''}" style="display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <!-- MSBTE Badge -->
      <div class="edu-partner-badge" title="MSBTE — Maharashtra State Board of Technical Education">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex-shrink:0;">
          <circle cx="16" cy="16" r="15" fill="#0D47A1" stroke="#FFD54F" stroke-width="1.5"/>
          <path d="M16 6 L20 12 L16 11 L12 12 Z" fill="#FFD54F"/>
          <circle cx="16" cy="18" r="6" fill="#1565C0" stroke="#FFF" stroke-width="1.2"/>
          <text x="16" y="20.5" font-size="7" font-weight="900" fill="#FFF" text-anchor="middle" font-family="Arial, sans-serif">TE</text>
        </svg>
        <div class="edu-partner-info">
          <span class="edu-partner-code">MSBTE</span>
          ${!compact ? '<span class="edu-partner-label">Board Accredited</span>' : ''}
        </div>
      </div>

      <!-- AICTE Badge -->
      <div class="edu-partner-badge" title="AICTE — All India Council for Technical Education">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex-shrink:0;">
          <circle cx="16" cy="16" r="15" fill="#BF360C" stroke="#FFE082" stroke-width="1.5"/>
          <path d="M16 7 C12 10, 10 15, 10 20 C13 18, 19 18, 22 20 C22 15, 20 10, 16 7 Z" fill="#FFE082"/>
          <circle cx="16" cy="19" r="4" fill="#E65100" stroke="#FFF" stroke-width="1"/>
          <polygon points="16,11 18,16 14,16" fill="#FFF"/>
        </svg>
        <div class="edu-partner-info">
          <span class="edu-partner-code">AICTE</span>
          ${!compact ? '<span class="edu-partner-label">Apex Technical Body</span>' : ''}
        </div>
      </div>

      <!-- Skill India / NSDC Badge -->
      <div class="edu-partner-badge" title="Skill India & NSDC National Standards">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex-shrink:0;">
          <circle cx="16" cy="16" r="15" fill="#1B5E20" stroke="#81C784" stroke-width="1.5"/>
          <path d="M16 6 L18 13 L25 14 L20 18 L22 25 L16 21 L10 25 L12 18 L7 14 L14 13 Z" fill="#FFB300"/>
          <circle cx="16" cy="16" r="4" fill="#0D5302" stroke="#FFF" stroke-width="1"/>
          <text x="16" y="18" font-size="6" font-weight="900" fill="#FFF" text-anchor="middle" font-family="Arial, sans-serif">SI</text>
        </svg>
        <div class="edu-partner-info">
          <span class="edu-partner-code">Skill India</span>
          ${!compact ? '<span class="edu-partner-label">NSDC Aligned</span>' : ''}
        </div>
      </div>

      <!-- NCVET Badge -->
      <div class="edu-partner-badge" title="NCVET — National Council for Vocational Education and Training">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex-shrink:0;">
          <rect width="30" height="30" x="1" y="1" rx="6" fill="#311B92" stroke="#B388FF" stroke-width="1.5"/>
          <path d="M7 11 L16 8 L25 11 L25 19 C25 24, 16 27, 16 27 C16 27, 7 24, 7 19 Z" fill="#4A148C" stroke="#EA80FC" stroke-width="1"/>
          <path d="M11 16 L14 19 L21 12" stroke="#69F0AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="edu-partner-info">
          <span class="edu-partner-code">NCVET</span>
          ${!compact ? '<span class="edu-partner-label">Vocational Standard</span>' : ''}
        </div>
      </div>
    </div>
  `;
}

// Renders the role-aware nav bar user badge + logout, used on dashboard pages
function renderUserBadge(elId) {
  const user = getUser();
  const el = document.getElementById(elId);
  if (!el || !user) return;
  const avatarHtml = renderAvatar(user.name, user.avatar_url, 34);

  const roleLabels = {
    student: 'Verified Student',
    industry: 'Employer & Industry',
    employer: 'Employer & Industry',
    institute: 'Accredited Institute',
    government: 'Government Officer',
    employee: 'Recruiter & Staff',
    investor: 'Impact Partner'
  };

  el.innerHTML = `
    <div style="display:inline-flex;align-items:center;gap:12px;">
      ${avatarHtml}
      <div style="display:flex;flex-direction:column;line-height:1.2;text-align:right;">
        <strong style="font-size:0.92rem;color:var(--slate-deep);">${escapeHtml(user.name)}</strong>
        <span class="muted" style="font-size:0.75rem;font-weight:600;color:#D97706;">${roleLabels[user.role] || user.role}</span>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="logout()" style="margin-left:4px;">Log out</button>
    </div>
  `;
}

// Auto-hydrate brand elements with modern SkillTrack SVG on page load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand').forEach(el => {
    if (!el.querySelector('.brand-svg-mark')) {
      const isHeader = !el.closest('.footer-official') && !el.closest('footer');
      el.innerHTML = getSkillTrackLogoHtml({
        size: 32,
        showText: true,
        subtitle: isHeader ? 'National Skill Portal' : 'Vocational Intelligence'
      });
    }
  });
});

// Modal Helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// Validation Helpers
function isValidPhone(p) {
  if (!p) return true;
  return /^[0-9+()\-\s]{7,20}$/.test(p);
}
function isValidCgpa(c) {
  if (c === '' || c === undefined || c === null) return true;
  const num = parseFloat(c);
  return !isNaN(num) && num >= 0 && num <= 10;
}
function isValidUrl(u) {
  if (!u) return true;
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// File Upload Helper
async function uploadFile(file) {
  if (!file) throw new Error('No file selected.');
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File exceeds 10MB limit.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api('/public/upload', {
          method: 'POST',
          body: {
            fileName: file.name,
            fileData: reader.result
          }
        });
        resolve(res);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// ==========================================================================
// Universal Full Trainee Profile Modal (SIH26135)
// Usable across Institute, Employer/Industry, and Government dashboards
// ==========================================================================
function ensureTraineeProfileModal() {
  if (document.getElementById('traineeFullProfileModal')) return;

  const modalHtml = `
    <div class="modal-backdrop" id="traineeFullProfileModal" style="z-index: 1100;">
      <div class="modal-box modal-box-lg" style="max-width: 960px; width: 95vw; max-height: 92vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="background: #FFFFFF; border-bottom: 1px solid var(--line); padding: 16px 24px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(22, 35, 58, 0.08); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">🎓</div>
            <div>
              <h3 id="tfp_modalTitle" style="margin: 0; font-size: 1.25rem;">Trainee Full Profile &amp; Credential Dossier</h3>
              <p class="muted mt-0" style="font-size: 0.82rem;" id="tfp_modalSub">Verified credentials, industry certificates, showcase projects &amp; AI readiness score</p>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal('traineeFullProfileModal')">&times;</button>
        </div>
        <div class="modal-body" id="tfp_modalBody" style="padding: 24px; overflow-y: auto; flex: 1; background: #FAFBFD;">
          <div style="text-align: center; padding: 48px 20px;">
            <div class="muted">Loading trainee credentials...</div>
          </div>
        </div>
        <div class="modal-footer" style="background: #FFFFFF; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; padding: 14px 24px;">
          <span class="muted" style="font-size: 0.82rem;">SkillTrack National Verified Trainee ID &middot; SIH26135 Oversight</span>
          <button type="button" class="btn btn-ghost" onclick="closeModal('traineeFullProfileModal')">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function viewFullStudentProfile(studentId) {
  ensureTraineeProfileModal();
  openModal('traineeFullProfileModal');

  const bodyEl = document.getElementById('tfp_modalBody');
  bodyEl.innerHTML = `
    <div style="text-align: center; padding: 50px 20px;">
      <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
      <div style="font-weight: 600; color: var(--slate-deep);">Loading Trainee Profile &amp; Credentials...</div>
      <p class="muted mt-1" style="font-size: 0.85rem;">Retrieving verified skills, accredited certificates, repository projects, and AI readiness breakdown.</p>
    </div>
  `;

  try {
    const data = await api('/public/trainee-profile/' + studentId);
    const { student, profile, skills = [], certificates = [], projects = [], enrollments = [], employmentRecords = [], quizAttempts = [], readiness = {} } = data;

    const traineeId = student.trainee_id || profile.trainee_id || ('ST-2026-TR-' + String(student.id).padStart(4, '0'));
    const readinessScore = readiness.readinessScore !== undefined ? readiness.readinessScore : 75;
    const readinessTier = readiness.tier || 'Industry Ready';
    const readinessBadgeColor = readiness.badgeColor || '#00875A';

    // Build skills pills
    const skillsHtml = skills.length ? skills.map(s => `
      <span class="pill ${s.verified ? 'pill-good' : ''}" style="display:inline-flex; align-items:center; gap:5px; margin:3px 4px; font-size:0.83rem; padding:4px 10px; background:#fff; border:1px solid ${s.verified ? '#A7F3D0' : 'var(--line)'};">
        ${s.verified ? '<span style="color:#059669; font-weight:700;">✔</span>' : ''}
        <strong>${escapeHtml(s.name)}</strong>
        <span class="muted" style="font-size:0.75rem; text-transform:capitalize;">(${escapeHtml(s.proficiency || 'Intermediate')})</span>
      </span>
    `).join('') : '<p class="muted" style="font-size:0.88rem; margin:0;">No technical skills listed yet.</p>';

    // Build certificates
    const certsHtml = certificates.length ? `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${certificates.map(c => `
          <div style="background: #FFFFFF; border: 1px solid var(--line); border-left: 4px solid #059669; border-radius: 6px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-weight: 700; color: var(--slate-deep); font-size: 0.95rem;">${escapeHtml(c.title)}</div>
              <div class="muted" style="font-size: 0.82rem; margin-top: 3px;">
                Issued by: <strong>${escapeHtml(c.issued_by || 'Accredited Partner')}</strong> &middot; Date: <strong>${fmtDate(c.issue_date)}</strong>
                ${c.course_title ? ` &middot; Course: <em>${escapeHtml(c.course_title)}</em>` : ''}
              </div>
            </div>
            <div>
              ${c.certificate_url ? `<a href="${c.certificate_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.8rem; border:1px solid var(--line);">📄 View Certificate</a>` : '<span class="pill pill-good" style="font-size:0.78rem;">Verified Authenticity</span>'}
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p class="muted" style="font-size:0.88rem; margin:0;">No accredited certificates issued yet.</p>';

    // Build projects
    const projectsHtml = projects.length ? `
      <div class="grid grid-2" style="gap: 14px;">
        ${projects.map(p => `
          <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; display: flex; flex-direction: column;">
            <div class="flex-between" style="align-items: flex-start;">
              <div style="font-weight: 700; color: var(--slate-deep); font-size: 0.96rem;">${escapeHtml(p.title)}</div>
              <span class="pill ${p.status === 'completed' ? 'pill-good' : 'pill-signal'}" style="font-size: 0.72rem; text-transform: capitalize;">${escapeHtml(p.status || 'Completed')}</span>
            </div>
            <p class="muted" style="font-size: 0.84rem; margin: 6px 0 10px; flex: 1;">${escapeHtml(p.description || 'Showcase development project demonstrating practical competencies.')}</p>
            ${p.tech_stack ? `
              <div style="margin-bottom: 10px;">
                <span class="muted" style="font-size:0.75rem; font-weight:600;">Tech Stack:</span>
                <span style="font-size: 0.8rem; color: var(--slate); font-family: monospace;">${escapeHtml(p.tech_stack)}</span>
              </div>
            ` : ''}
            <div class="flex gap-1" style="border-top: 1px solid #F1F5F9; padding-top: 8px; margin-top: auto;">
              ${p.repo_url ? `<a href="${p.repo_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.78rem; padding: 3px 8px;">🐙 Code Repo</a>` : ''}
              ${p.project_url ? `<a href="${p.project_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.78rem; padding: 3px 8px;">🌐 Live Demo</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p class="muted" style="font-size:0.88rem; margin:0;">No capstone projects registered yet.</p>';

    // Build enrollments
    const enrollHtml = enrollments.length ? `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${enrollments.map(e => `
          <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem;">
            <div>
              <strong>${escapeHtml(e.course_title || 'Vocational Course')}</strong>
              <div class="muted" style="font-size: 0.78rem;">${escapeHtml(e.category || 'Technical')} &middot; ${escapeHtml(e.duration_weeks ? e.duration_weeks + ' Weeks' : '8 Weeks')}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="min-width: 100px;">
                <div class="score-track" style="height: 6px;"><div class="score-fill" style="width:${e.progress_percent || 0}%;"></div></div>
                <div class="muted" style="font-size:0.75rem; text-align:right;">${e.progress_percent || 0}%</div>
              </div>
              <span class="pill ${e.status === 'completed' ? 'pill-good' : ''}" style="font-size: 0.74rem;">${escapeHtml(e.status || 'Enrolled')}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '<p class="muted" style="font-size:0.88rem; margin:0;">No training courses enrolled.</p>';

    // Build employment records
    const empHtml = employmentRecords.length ? `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${employmentRecords.map(er => `
          <div style="background: #FFFFFF; border: 1px solid var(--line); border-left: 4px solid #2563EB; border-radius: 6px; padding: 12px 16px;">
            <div class="flex-between">
              <div>
                <strong>${escapeHtml(er.job_title || 'Trainee Apprentice')}</strong> &middot; <span>${escapeHtml(er.employer_name || er.company_name || 'Hiring Partner')}</span>
                <div class="muted" style="font-size: 0.82rem; margin-top: 2px;">
                  Milestone: <strong>${er.milestone_days || 30} Days</strong> &middot; Status: <strong>${escapeHtml(er.outcome_type || er.status || 'employed')}</strong>
                  ${er.monthly_salary ? ` &middot; Salary: <strong style="color:#059669;">₹${Number(er.monthly_salary).toLocaleString('en-IN')}/mo</strong>` : ''}
                </div>
              </div>
              <span class="pill pill-${er.verification_level === 'employer_verified' ? 'good' : 'signal'}" style="font-size:0.75rem;">
                ${er.verification_level ? er.verification_level.replace(/_/g, ' ') : 'Self-Reported'}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    bodyEl.innerHTML = `
      <!-- 1. HEADER PROFILE CARD -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04); margin-bottom: 20px;">
        <div class="flex gap-2" style="align-items: flex-start; flex-wrap: wrap;">
          <div>
            ${renderAvatar(student.name, student.avatar_url, 80)}
          </div>
          <div style="flex: 1; min-width: 260px;">
            <div class="flex-between" style="align-items: flex-start;">
              <div>
                <h2 style="margin: 0; font-size: 1.45rem; color: var(--slate-deep); display: flex; align-items: center; gap: 10px;">
                  ${escapeHtml(student.name)}
                </h2>
                <div style="margin-top: 4px;">
                  <span class="pill" style="font-family: monospace; font-weight: 700; background: #0F172A; color: #F8FAFC; padding: 2px 8px; font-size: 0.78rem;">ID: ${escapeHtml(traineeId)}</span>
                  <span class="pill pill-good" style="margin-left: 6px; font-size: 0.78rem; text-transform: capitalize;">${escapeHtml(profile.employment_status || 'Seeking Placement')}</span>
                </div>
              </div>
            </div>

            <!-- College & Location Meta -->
            <div style="margin-top: 10px; font-size: 0.88rem; color: var(--ink-soft); line-height: 1.5;">
              <div>🏛 <strong>College:</strong> ${escapeHtml(profile.college || 'Polytechnic / ITI Institute')}</div>
              <div>📚 <strong>Branch:</strong> ${escapeHtml(profile.branch || 'Vocational Training')} &middot; <strong>Year / Sem:</strong> ${escapeHtml(profile.current_year || 'Final Year')} ${profile.semester ? `(${escapeHtml(profile.semester)})` : ''} &middot; <strong>CGPA:</strong> ${profile.cgpa ? `<strong>${escapeHtml(profile.cgpa)}</strong>` : '—'}</div>
              <div>📍 <strong>District:</strong> ${escapeHtml(profile.district || 'Maharashtra')} ${profile.state ? `, ${escapeHtml(profile.state)}` : ''}</div>
              <div style="margin-top: 4px;">
                ✉ <a href="mailto:${escapeHtml(student.email)}" style="color: var(--slate-deep); font-weight: 500;">${escapeHtml(student.email)}</a>
                ${student.phone ? ` &middot; 📞 <a href="tel:${escapeHtml(student.phone)}" style="color: var(--slate-deep);">${escapeHtml(student.phone)}</a>` : ''}
              </div>
            </div>

            <!-- Profile Links & Documents -->
            <div class="flex gap-1 mt-2" style="flex-wrap: wrap;">
              ${profile.resume_url ? `<a href="${profile.resume_url}" target="_blank" class="btn btn-outline btn-sm" style="font-size:0.82rem; padding: 4px 10px;">📄 Download / View Resume</a>` : ''}
              ${profile.linkedin_url ? `<a href="${profile.linkedin_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.82rem; padding: 4px 10px; border:1px solid var(--line);">🔗 LinkedIn</a>` : ''}
              ${profile.github_url ? `<a href="${profile.github_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.82rem; padding: 4px 10px; border:1px solid var(--line);">🐙 GitHub</a>` : ''}
              ${profile.portfolio_url ? `<a href="${profile.portfolio_url}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.82rem; padding: 4px 10px; border:1px solid var(--line);">🌐 Portfolio</a>` : ''}
            </div>
          </div>
        </div>

        ${profile.bio ? `
          <div style="background: var(--paper); border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; margin-top: 14px; font-size: 0.88rem; color: var(--ink);">
            <strong>Professional Summary:</strong> ${escapeHtml(profile.bio)}
          </div>
        ` : ''}
      </div>

      <!-- 2. EMPLOYABILITY READINESS SCORE CARD -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
        <div class="flex-between" style="align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 64px; height: 64px; border-radius: 50%; border: 4px solid ${readinessBadgeColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F8FAFC;">
              <span style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; line-height: 1; color: var(--slate-deep);">${readinessScore}</span>
              <span style="font-size: 0.65rem; color: #64748B;">/100</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 style="margin: 0; font-size: 1.1rem; color: var(--slate-deep);">AI Employability Readiness</h4>
                <span class="pill" style="background: ${readinessBadgeColor}; color: #FFFFFF; font-size: 0.76rem; font-weight: 700;">${escapeHtml(readinessTier)}</span>
              </div>
              <p class="muted mt-0" style="font-size: 0.8rem; margin-top: 2px;">Multi-dimensional algorithmic assessment based on verified skills, projects, and certifications.</p>
            </div>
          </div>
          <div style="font-size: 0.78rem; color: #64748B; font-style: italic; background: #F8FAFC; padding: 6px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
            ⚖️ ${escapeHtml(readiness.disclaimer || 'A readiness indicator, not a guarantee of employment.')}
          </div>
        </div>

        ${readiness.breakdown && readiness.breakdown.length ? `
          <div class="grid grid-2 mt-2" style="gap: 10px; border-top: 1px solid #F1F5F9; padding-top: 14px;">
            ${readiness.breakdown.map(b => `
              <div style="background: #FAFBFD; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0; font-size: 0.82rem;">
                <div class="flex-between">
                  <strong>${escapeHtml(b.factor)}</strong>
                  <span style="color: var(--slate-deep); font-weight: 700;">${b.score}/${b.max} pts</span>
                </div>
                <div class="muted mt-0" style="font-size: 0.76rem;">${escapeHtml(b.detail || '')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- 3. VERIFIED SKILLS -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
        <div class="flex-between" style="margin-bottom: 12px;">
          <h4 style="margin: 0; font-size: 1.05rem; color: var(--slate-deep);">Technical Skills &amp; Proficiencies (${skills.length})</h4>
          <span class="muted" style="font-size: 0.8rem;">✔ Indicates verified by assessment or course challenge</span>
        </div>
        <div>${skillsHtml}</div>
      </div>

      <!-- 4. ACCREDITED CERTIFICATES -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px; font-size: 1.05rem; color: var(--slate-deep);">Accredited Certificates &amp; Credentials (${certificates.length})</h4>
        <div>${certsHtml}</div>
      </div>

      <!-- 5. SHOWCASE PROJECTS -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px; font-size: 1.05rem; color: var(--slate-deep);">Showcase Projects &amp; Capstones (${projects.length})</h4>
        <div>${projectsHtml}</div>
      </div>

      <!-- 6. TRAINING ENROLLMENTS -->
      <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px; font-size: 1.05rem; color: var(--slate-deep);">Vocational Training Programs Enrolled (${enrollments.length})</h4>
        <div>${enrollHtml}</div>
      </div>

      ${empHtml ? `
        <!-- 7. LONGITUDINAL EMPLOYMENT MILESTONES -->
        <div style="background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05rem; color: var(--slate-deep);">Longitudinal Employment &amp; Retention Milestones (${employmentRecords.length})</h4>
          <div>${empHtml}</div>
        </div>
      ` : ''}
    `;
  } catch (err) {
    console.error('Error fetching student profile:', err);
    bodyEl.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--bad);">
        <div style="font-size: 2rem;">⚠️</div>
        <h3>Unable to load trainee profile</h3>
        <p class="muted">${escapeHtml(err.message || 'Please check network connection or verify that this trainee exists.')}</p>
        <button class="btn btn-ghost btn-sm mt-2" onclick="viewFullStudentProfile(${studentId})">Try Again</button>
      </div>
    `;
  }
}


