// skillgap.js - AI Skill Gap Analysis Page matching Screen 5
let chartDemandSupplyInstance = null;
let skillGapDataPayload = null;

async function loadSkillGapPageData() {
  await refreshSkillGapData();
}

async function refreshSkillGapData() {
  const sector = document.getElementById('filterSector') ? document.getElementById('filterSector').value : 'IT & Software';
  const district = document.getElementById('filterDistrict') ? document.getElementById('filterDistrict').value : 'All Districts';
  const period = document.getElementById('filterPeriod') ? document.getElementById('filterPeriod').value : 'Last 12 Months';

  try {
    const res = await fetch(`/api/gov/skill-gap-analysis?sector=${encodeURIComponent(sector)}&district=${encodeURIComponent(district)}&period=${encodeURIComponent(period)}`);
    skillGapDataPayload = await res.json();

    renderSkillGapsTable(skillGapDataPayload.skillGaps);
    renderDemandVsSupplyChart(skillGapDataPayload.skillGaps);
    renderAIInsights(skillGapDataPayload.aiInsights);
    renderAIRecommendations(skillGapDataPayload.aiRecommendations);
  } catch (err) {
    console.error("Failed to load skill gap data", err);
  }
}

function renderSkillGapsTable(gaps) {
  const tbody = document.getElementById('skillGapsTableBody');
  if (!tbody || !gaps) return;

  tbody.innerHTML = '';
  gaps.forEach(g => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${g.skill}</strong></td>
      <td><span style="font-weight: 600;">${g.demandScore}%</span></td>
      <td><span style="font-weight: 600;">${g.supplyScore}%</span></td>
      <td><strong style="color: #1d4ed8;">${g.gapScore}%</strong></td>
      <td>
        <span class="trend-badge ${g.trend.toLowerCase()}">
          <i class="fa-solid fa-arrow-up"></i> ${g.trend}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDemandVsSupplyChart(gaps) {
  const ctx = document.getElementById('chartDemandVsSupply');
  if (!ctx || !gaps) return;

  if (chartDemandSupplyInstance) chartDemandSupplyInstance.destroy();

  const labels = gaps.map(g => {
    if (g.skill.includes('AWS')) return 'Cloud Computing';
    if (g.skill.includes('Machine')) return 'AI / ML';
    return g.skill;
  });

  const demandData = gaps.map(g => g.demandScore);
  const supplyData = gaps.map(g => g.supplyScore);

  chartDemandSupplyInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Demand',
          data: demandData,
          backgroundColor: '#1d4ed8',
          borderRadius: 4
        },
        {
          label: 'Supply',
          data: supplyData,
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#f1f5f9' }, max: 100, beginAtZero: true }
      }
    }
  });
}

function renderAIInsights(insights) {
  const container = document.getElementById('aiInsightsList');
  if (!container || !insights) return;

  container.innerHTML = '';
  insights.forEach(ins => {
    const item = document.createElement('div');
    item.className = 'insight-item';
    item.innerHTML = `<i class="fa-solid fa-sparkles" style="color: #1d4ed8; margin-right: 0.35rem;"></i> ${ins}`;
    container.appendChild(item);
  });
}

function renderAIRecommendations(recommendations) {
  const container = document.getElementById('aiRecommendationsList');
  if (!container || !recommendations) return;

  container.innerHTML = '';
  recommendations.forEach(rec => {
    const row = document.createElement('div');
    row.className = 'recommendation-row';
    row.innerHTML = `
      <span>${rec.title}</span>
      <span class="badge-impact ${rec.color}">${rec.impact}</span>
    `;
    container.appendChild(row);
  });
}
