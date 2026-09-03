// government.js - Government Directorate Portal with Early Warning System, Skill Demand Heatmap & Training Provider Performance
function navToGovernmentView(subView) {
  document.querySelectorAll('.screen-view').forEach(s => s.style.display = 'none');
  const screen = document.getElementById('screen-government');
  if (screen) screen.style.display = 'grid';

  document.querySelectorAll('#screen-government .sidebar-menu li').forEach(li => li.classList.remove('active'));
  const activeLi = document.getElementById(`smenu-government-${subView}`);
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

  const container = document.getElementById('governmentContentArea');
  if (!container) return;

  const gov = window.SKT_STATE.government;

  switch (subView) {
    case 'dashboard': renderGovernmentDashboard(container, gov); break;
    case 'earlywarning': renderEarlyWarningSystem(container, gov); break;
    case 'providers': renderTrainingProviderPerformance(container, gov); break;
    case 'heatmap': renderSkillDemandHeatmap(container, gov); break;
    case 'unemployment': renderUnemploymentReasonsAnalytics(container, gov); break;
    case 'district': renderGovernmentDistrict(container, gov); break;
    case 'training': renderGovernmentTraining(container, gov); break;
    case 'reports': renderGovernmentReports(container, gov); break;
    case 'profile': renderGovernmentProfileSettings(container, gov); break;
    default: renderGovernmentDashboard(container, gov);
  }

  window.location.hash = `government/${subView}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navToGovernmentView = navToGovernmentView;

// 1. Government Dashboard (Overview with Macro Metrics)
function renderGovernmentDashboard(container, gov) {
  const k = gov.kpis || {};
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Maharashtra State Skilling & Placement Telemetry</h2>
        <p><i class="fa-solid fa-landmark"></i> ${gov.organization} &bull; ${gov.department}</p>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-outline" onclick="navToGovernmentView('heatmap')"><i class="fa-solid fa-map"></i> Skill Heatmap</button>
        <button class="btn btn-primary" onclick="navToGovernmentView('earlywarning')" style="background:#dc2626; border-color:#dc2626;"><i class="fa-solid fa-triangle-exclamation"></i> 🚨 Early Warning System (3 Alerts)</button>
      </div>
    </div>

    <!-- 6 Macro KPIs (Placement Rate, Retention, Salary Growth, Course Performance) -->
    <div class="stat-cards-grid-6">
      <div class="dash-stat-card"><span class="stat-label">Total Trainees</span><strong class="stat-val">${k.totalTrainees}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Placement Rate</span><strong class="stat-val highlight-blue">${k.placementRate}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">6M Retention Rate</span><strong class="stat-val highlight-green">${k.retention6M}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">12M Retention Rate</span><strong class="stat-val highlight-green">${k.retention12M}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Average Base Salary</span><strong class="stat-val">${k.averageSalary}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">YoY Salary Growth</span><strong class="stat-val highlight-green">${k.salaryGrowthYoY}</strong></div>
    </div>

    <!-- Quick Navigation Highlights -->
    <div class="grid-2col-even" style="margin-bottom:1.5rem;">
      <div class="card" style="border-left: 4px solid #dc2626;">
        <div class="card-head space-between">
          <h3 style="color:#b91c1c;"><i class="fa-solid fa-triangle-exclamation"></i> 🚨 AI Early Warning System</h3>
          <button class="btn btn-sm btn-outline" onclick="navToGovernmentView('earlywarning')">Review Interventions &rarr;</button>
        </div>
        <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
          Predicts cohorts and trainees likely to remain unemployed, leave jobs prematurely, or experience acute skill deficits.
        </p>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <span class="badge-pill danger"><i class="fa-solid fa-circle-exclamation"></i> Batch #44 Nashik: Unemployed Risk (Critical)</span>
          <span class="badge-pill warning"><i class="fa-solid fa-clock"></i> Thane BPO: Attrition Risk (High)</span>
        </div>
      </div>

      <div class="card" style="border-left: 4px solid #2563eb;">
        <div class="card-head space-between">
          <h3><i class="fa-solid fa-map-location-dot text-primary"></i> Skill Demand Heatmap</h3>
          <button class="btn btn-sm btn-outline" onclick="navToGovernmentView('heatmap')">Explore Districts &rarr;</button>
        </div>
        <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.75rem;">
          Cross-references district talent supply against employer demand to pinpoint localized course launch requirements.
        </p>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <span class="badge-pill info">Pune: AWS Cloud Shortage (64%)</span>
          <span class="badge-pill info">Nagpur: Data Science Deficit (53%)</span>
          <span class="badge-pill info">Aurangabad: EV Battery Tech (58%)</span>
        </div>
      </div>
    </div>

    <!-- Training Provider Performance Summary -->
    <div class="card">
      <div class="card-head space-between">
        <h3>Training Provider Performance Comparison</h3>
        <button class="btn btn-sm btn-outline" onclick="navToGovernmentView('providers')">View Full Provider Matrix &rarr;</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Rank</th><th>Institute Name</th><th>District</th><th>Placement %</th><th>6M Retention</th><th>12M Retention</th><th>Salary Growth</th><th>Satisfaction</th></tr></thead>
          <tbody>
            ${(gov.trainingProviderPerformance || []).slice(0, 3).map(p => `
              <tr>
                <td><strong>#${p.rank}</strong></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.district}</td>
                <td><strong class="highlight-green">${p.placementRate}</strong></td>
                <td>${p.retention6M}</td>
                <td>${p.retention12M}</td>
                <td><strong class="highlight-green">${p.salaryImprovement}</strong></td>
                <td><span class="badge-pill badge-employed">${p.employerSatisfaction}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. 🚨 Early Warning System (AI Prediction for At-Risk Trainees & Courses)
function renderEarlyWarningSystem(container, gov) {
  const alerts = gov.earlyWarningAlerts || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>🚨 AI Early Warning System & Proactive Policy Intervention</h2>
        <p>Identifies trainees, cohorts, and vocational programs likely to suffer poor employment outcomes before issues become irreversible.</p>
      </div>
    </div>

    <!-- Early Warning 3 Categories Summary -->
    <div class="stat-cards-grid-4" style="margin-bottom:1.5rem;">
      <div class="dash-stat-card" style="border-top:3px solid #dc2626;"><span class="stat-label">Likely to Remain Unemployed</span><strong class="stat-val highlight-red" style="color:#dc2626;">1 Cohort</strong></div>
      <div class="dash-stat-card" style="border-top:3px solid #f59e0b;"><span class="stat-label">Likely to Leave Job (Attrition)</span><strong class="stat-val" style="color:#d97706;">1 Cohort</strong></div>
      <div class="dash-stat-card" style="border-top:3px solid #3b82f6;"><span class="stat-label">Curriculum Skill Mismatch</span><strong class="stat-val highlight-blue">1 Domain</strong></div>
      <div class="dash-stat-card" style="border-top:3px solid #10b981;"><span class="stat-label">Interventions Dispatched</span><strong class="stat-val highlight-green">100%</strong></div>
    </div>

    <!-- Alert Cards -->
    <div style="display:flex; flex-direction:column; gap:1.25rem;">
      ${alerts.map(a => `
        <div class="card" style="border-left:5px solid ${a.severity === 'Critical' ? '#dc2626' : (a.severity === 'High' ? '#ea580c' : '#f59e0b')}; background:#ffffff;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.35rem;">
                <span class="badge-pill danger" style="font-size:0.75rem;"><i class="fa-solid fa-triangle-exclamation"></i> ${a.riskType.toUpperCase()}</span>
                <span class="badge-pill ${a.severity === 'Critical' ? 'danger' : 'warning'}" style="font-size:0.75rem;">SEVERITY: ${a.severity}</span>
              </div>
              <h3 style="font-size:1.15rem; color:#0f172a; margin-bottom:0.25rem;">${a.targetEntity}</h3>
              <p style="font-size:0.85rem; color:#475569;"><strong>Underlying Cause:</strong> ${a.reason}</p>
            </div>
          </div>

          <div class="grid-2col-even" style="margin:1rem 0; gap:1rem; background:#f8fafc; padding:1rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
            <div>
              <strong style="color:#991b1b; font-size:0.8rem; text-transform:uppercase; display:block; margin-bottom:0.25rem;"><i class="fa-solid fa-chart-line-down"></i> Predicted Impact:</strong>
              <p style="font-size:0.85rem; color:#334155; line-height:1.5;">${a.predictedOutcome}</p>
            </div>
            <div>
              <strong style="color:#1d4ed8; font-size:0.8rem; text-transform:uppercase; display:block; margin-bottom:0.25rem;"><i class="fa-solid fa-shield-check"></i> Recommended Directorate Intervention:</strong>
              <p style="font-size:0.85rem; color:#334155; line-height:1.5;">${a.suggestedIntervention}</p>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" onclick="showToast('Intervention directive dispatched to institute & state nodal officer!', 'success')"><i class="fa-solid fa-paper-plane"></i> Execute Policy Intervention</button>
            <button class="btn btn-sm btn-outline" onclick="showToast('Assigned to counseling oversight team', 'info')"><i class="fa-solid fa-users"></i> Assign Career Counselor</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 3. Training Provider Performance (Comparative Benchmarking)
function renderTrainingProviderPerformance(container, gov) {
  const providers = gov.trainingProviderPerformance || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Training Provider & Institute Performance Comparison</h2>
        <p>Longitudinal ranking based on placement rate, 6 & 12-month retention, salary improvement, and employer satisfaction.</p>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Rank</th><th>Institute Name</th><th>District</th><th>Placement %</th><th>6-Month Retention</th><th>12-Month Retention</th><th>Salary Improvement</th><th>Employer Satisfaction</th><th>Skill-Gap Rate</th></tr></thead>
          <tbody>
            ${providers.map(p => `
              <tr>
                <td><strong>#${p.rank}</strong></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.district}</td>
                <td><strong class="highlight-green">${p.placementRate}</strong></td>
                <td>${p.retention6M}</td>
                <td>${p.retention12M}</td>
                <td><strong class="highlight-green">${p.salaryImprovement}</strong></td>
                <td><span class="badge-pill badge-employed">${p.employerSatisfaction}</span></td>
                <td><span class="badge-pill ${p.skillGapRate.includes('Low') ? 'badge-employed' : 'warning'}">${p.skillGapRate}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 4. Skill Demand Heatmap (District -> Available Skills -> Job Demand -> Skill Shortage -> Courses to Start)
function renderSkillDemandHeatmap(container, gov) {
  const heatmap = gov.skillDemandHeatmap || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>🗺️ Skill Demand Heatmap & Course Allocation Intelligence</h2>
        <p>Cross-district telemetry showing available talent skills vs employer hiring demand to determine new course approvals.</p>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>District</th><th>Current Available Skills</th><th>Industry Job Demand</th><th>Identified Skill Shortage</th><th>Deficit Severity</th><th>Recommended Course to Launch</th><th>Action</th></tr></thead>
          <tbody>
            ${heatmap.map(h => `
              <tr>
                <td><strong>${h.district}</strong></td>
                <td>${h.availableSkills}</td>
                <td><strong>${h.jobDemand}</strong></td>
                <td><strong class="highlight-blue">${h.skillShortage}</strong></td>
                <td><span class="badge-pill ${h.status.includes('Critical') ? 'danger' : 'warning'}">${h.status}</span></td>
                <td style="font-size:0.8rem; color:#1e293b;">${h.recommendedCoursesToStart}</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="showToast('New course allocation order approved for ${h.district}!', 'success')"><i class="fa-solid fa-plus"></i> Launch Course</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 5. Reasons for Unemployment Analytics Breakdown
function renderUnemploymentReasonsAnalytics(container, gov) {
  const reasons = gov.unemploymentReasonsBreakdown || [];
  container.innerHTML = `
    <div class="welcome-row">
      <div>
        <h2>Reasons for Unemployment (Candidate Diagnostic Telemetry)</h2>
        <p>In-depth state survey analytics capturing why candidates are currently unplaced to guide systemic corrections.</p>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Reported Reason for Unemployment</th><th>Percentage Share</th><th>Affected Trainees</th><th>State Directorate Action Policy</th></tr></thead>
          <tbody>
            ${reasons.map(r => `
              <tr>
                <td><strong>${r.reason}</strong></td>
                <td><strong class="highlight-blue">${r.percentage}%</strong></td>
                <td>${r.count.toLocaleString()} Trainees</td>
                <td><span class="badge-pill info">${r.trend}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 6. District Analytics
function renderGovernmentDistrict(container, gov) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>36-District Comprehensive Skilling Telemetry</h2><p>Cross-district enrollment, completion rates, and industrial intake.</p></div></div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>District</th><th>Enrolled</th><th>Certified</th><th>Placed</th><th>Placement %</th><th>Priority Skill Deficit</th></tr></thead>
          <tbody>
            ${(gov.districtAnalytics || []).map(d => `
              <tr>
                <td><strong>${d.district}</strong></td>
                <td>${d.enrolled.toLocaleString()}</td>
                <td>${d.certified.toLocaleString()}</td>
                <td>${d.placed.toLocaleString()}</td>
                <td><strong class="highlight-green">${d.rate}</strong></td>
                <td><span class="badge-pill info">${d.topDemand}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 7. Training Analytics
function renderGovernmentTraining(container, gov) {
  const t = gov.trainingAnalytics || {};
  container.innerHTML = `
    <div class="welcome-row"><div><h2>State Training Operations & Capacity</h2><p>Classroom operations, gender distribution, and completion rates.</p></div></div>
    <div class="stat-cards-grid-4">
      <div class="dash-stat-card"><span class="stat-label">Total Programs</span><strong class="stat-val">${t.totalCoursesConducted || 1420}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Active Classrooms</span><strong class="stat-val">${t.activeClassrooms || 890}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Male / Female Ratio</span><strong class="stat-val">${t.maleFemaleRatio || '54% / 46%'}</strong></div>
      <div class="dash-stat-card"><span class="stat-label">Completion Rate</span><strong class="stat-val highlight-green">${t.completionRate || '89.2%'}</strong></div>
    </div>
  `;
}

// 8. State Reports
function renderGovernmentReports(container, gov) {
  container.innerHTML = `
    <div class="welcome-row">
      <div><h2>State Workforce Reports Archive</h2><p>Download official quarterly workforce intelligence documents.</p></div>
      <button class="btn btn-primary btn-sm" onclick="showToast('Official state report generated & archived', 'success')"><i class="fa-solid fa-plus"></i> Generate Whitepaper</button>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead><tr><th>Report Code</th><th>Document Title</th><th>Publication Date</th><th>Generated By</th><th>Action</th></tr></thead>
          <tbody>
            ${(gov.reports || []).map(r => `
              <tr>
                <td><code>${r.id}</code></td>
                <td><strong>${r.title}</strong></td>
                <td>${r.date}</td>
                <td>${r.author}</td>
                <td><button class="btn btn-sm btn-outline" onclick="alert('Downloading official PDF: ${r.title}');"><i class="fa-solid fa-download"></i> PDF</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 9. Profile Settings
function renderGovernmentProfileSettings(container, gov) {
  container.innerHTML = `
    <div class="welcome-row"><div><h2>Government Profile Settings</h2><p>Manage official designation, assigned district jurisdiction, and government department contact credentials.</p></div></div>
    <div class="card" style="max-width:800px;">
      <form onsubmit="saveGovernmentProfileSettings(event)">
        <div class="form-row">
          <div class="form-group"><label>Officer Full Name</label><input type="text" id="govName" value="${gov.name}" required /></div>
          <div class="form-group"><label>Official Designation</label><input type="text" id="govDesignation" value="${gov.designation}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Government Organization</label><input type="text" id="govOrg" value="${gov.organization}" required /></div>
          <div class="form-group"><label>Government Department</label><input type="text" id="govDept" value="${gov.department}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Assigned District / Division</label><input type="text" id="govDistrict" value="${gov.assignedDistrict || 'Pune'}" required /></div>
          <div class="form-group"><label>Official Contact Phone</label><input type="text" id="govPhone" value="${gov.officialPhone || ''}" required /></div>
        </div>
        <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save Government Settings</button>
      </form>
    </div>
  `;
}

function saveGovernmentProfileSettings(e) {
  e.preventDefault();
  const gov = window.SKT_STATE.government;
  gov.name = document.getElementById('govName').value.trim();
  gov.designation = document.getElementById('govDesignation').value.trim();
  gov.organization = document.getElementById('govOrg').value.trim();
  gov.department = document.getElementById('govDept').value.trim();
  gov.assignedDistrict = document.getElementById('govDistrict').value.trim();
  gov.officialPhone = document.getElementById('govPhone').value.trim();

  if (window.saveLocalSktState) window.saveLocalSktState();
  showToast("Government profile settings saved successfully!", "success");
  navToGovernmentView('profile');
}
