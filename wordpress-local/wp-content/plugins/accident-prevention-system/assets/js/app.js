const boot = window.APS_BOOTSTRAP || {};
const apiBase = boot.apiBase || '';

const analyzeForm = document.getElementById('analyzeForm');
const alertForm = document.getElementById('alertForm');
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');
const analysisResult = document.getElementById('analysisResult');
const alertStatus = document.getElementById('alertStatus');
const reportsBody = document.querySelector('#reportsTable tbody');

let typeChart;
let survivalChart;

if (videoInput) {
  videoInput.addEventListener('change', () => {
    const [file] = videoInput.files;
    if (!file) return;
    videoPreview.src = URL.createObjectURL(file);
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload;
}

if (analyzeForm) {
  analyzeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    analysisResult.classList.remove('hidden');
    analysisResult.textContent = 'Analyzing simulation feed...';

    try {
      const payload = await apiRequest('/analyze', { method: 'POST' });
      analysisResult.innerHTML = `
        <strong>Incident ${payload.report.incidentId}</strong><br/>
        Severity: <b>${payload.report.severity}</b><br/>
        Estimated Speed Risk: ${payload.report.speedRisk}<br/>
        Damage Class: ${payload.report.damageClass}<br/>
        Survival Probability: ${payload.report.survivalRate}%
      `;
      document.getElementById('incidentId').value = payload.report.incidentId;
      await loadSummary();
    } catch (err) {
      analysisResult.textContent = err.message;
    }
  });
}

if (alertForm) {
  alertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      incidentId: document.getElementById('incidentId').value,
      authorityContact: document.getElementById('authorityContact').value,
      preventiveMeasures: document.getElementById('preventiveMeasures').value,
      remedialMeasures: document.getElementById('remedialMeasures').value,
    };

    try {
      const payload = await apiRequest('/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      alertStatus.classList.remove('hidden');
      alertStatus.innerHTML = `Authority notified: <b>${payload.alert.authorityContact}</b> at ${new Date(payload.alert.notifiedAt).toLocaleString()}`;
    } catch (err) {
      alertStatus.classList.remove('hidden');
      alertStatus.textContent = err.message;
    }
  });
}

function renderTable(reports) {
  if (!reportsBody) return;
  reportsBody.innerHTML = reports.map((r) => `
    <tr>
      <td>${r.incidentId}</td>
      <td>${new Date(r.timestamp).toLocaleString()}</td>
      <td>${r.location}</td>
      <td>${r.severity}</td>
      <td>${r.survivalRate}%</td>
      <td>${(r.preventiveMeasures || '-').slice(0, 40)} / ${(r.remedialMeasures || '-').slice(0, 40)}</td>
      <td>-</td>
    </tr>
  `).join('');
}

function renderCharts(summary) {
  const typeCtx = document.getElementById('accidentTypeChart');
  const survivalCtx = document.getElementById('survivalRateChart');
  if (!typeCtx || !survivalCtx || typeof Chart === 'undefined') return;

  if (typeChart) typeChart.destroy();
  if (survivalChart) survivalChart.destroy();

  typeChart = new Chart(typeCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(summary.bySeverity),
      datasets: [{
        data: Object.values(summary.bySeverity),
        backgroundColor: ['#ff6b6b', '#ffd166', '#4ecdc4', '#7adf9a'],
      }],
    },
  });

  survivalChart = new Chart(survivalCtx, {
    type: 'bar',
    data: {
      labels: ['Average Survival Rate', 'Critical Cases'],
      datasets: [{
        label: 'Percentage',
        data: [summary.averageSurvivalRate, summary.criticalRate],
        backgroundColor: ['#4ecdc4', '#ff6b6b'],
      }],
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } },
  });
}

async function loadSummary() {
  try {
    const [reports, summary] = await Promise.all([
      apiRequest('/reports'),
      apiRequest('/summary'),
    ]);
    renderTable(reports);
    renderCharts(summary);
  } catch {
    renderTable(boot.demoReports || []);
    renderCharts(boot.demoSummary || { bySeverity: { Low: 1 }, averageSurvivalRate: 90, criticalRate: 0 });
  }
}

loadSummary();
