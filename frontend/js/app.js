const API_CANDIDATES = [
  window.localStorage.getItem('apiBase') || '',
  `${window.location.origin}/api`,
  '/api',
];

const mockReports = [
  {
    incidentId: 'SIM-0001',
    timestamp: new Date().toISOString(),
    location: 'Demo Corridor - Sector 7',
    severity: 'Moderate',
    survivalRate: 78,
    preventiveMeasures: 'Dynamic speed signage, lane warnings',
    remedialMeasures: 'Emergency lane opened, dispatch sent',
    videoFilename: '',
  },
];

const mockSummary = {
  bySeverity: { Critical: 0, High: 1, Moderate: 2, Low: 1 },
  averageSurvivalRate: 74,
  criticalRate: 0,
};

const analyzeForm = document.getElementById('analyzeForm');
const alertForm = document.getElementById('alertForm');
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');
const analysisResult = document.getElementById('analysisResult');
const alertStatus = document.getElementById('alertStatus');
const reportsBody = document.querySelector('#reportsTable tbody');

let typeChart;
let survivalChart;
let activeApiBase = null;

videoInput.addEventListener('change', () => {
  const [file] = videoInput.files;
  if (!file) return;
  videoPreview.src = URL.createObjectURL(file);
});

async function probeApiBase() {
  for (const base of API_CANDIDATES) {
    const normalized = base.endsWith('/api') ? base : `${base}/api`;
    try {
      const response = await fetch(`${normalized}/summary`, { method: 'GET' });
      if (response.ok) {
        activeApiBase = normalized;
        return;
      }
    } catch {
      // continue to next candidate
    }
  }
  activeApiBase = null;
}

async function apiRequest(path, options = {}) {
  if (!activeApiBase) {
    throw new Error('API server is not reachable. Start backend-node and open http://localhost:8080.');
  }

  const response = await fetch(`${activeApiBase}${path}`, options);
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await response.json() : { error: await response.text() };

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

analyzeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(analyzeForm);

  analysisResult.classList.remove('hidden');
  analysisResult.textContent = 'Analyzing video...';

  try {
    const payload = await apiRequest('/analyze', {
      method: 'POST',
      body: formData,
    });

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
    await loadSummary();
  } catch (err) {
    alertStatus.classList.remove('hidden');
    alertStatus.textContent = err.message;
  }
});

function renderTable(reports) {
  reportsBody.innerHTML = reports.map((r) => {
    const footageCell = r.videoFilename && activeApiBase
      ? `<a href="${window.location.origin}/uploads/${r.videoFilename}" target="_blank" rel="noopener">View</a>`
      : '-';

    return `
      <tr>
        <td>${r.incidentId}</td>
        <td>${new Date(r.timestamp).toLocaleString()}</td>
        <td>${r.location}</td>
        <td>${r.severity}</td>
        <td>${r.survivalRate}%</td>
        <td>${(r.preventiveMeasures || '-').slice(0, 40)} / ${(r.remedialMeasures || '-').slice(0, 40)}</td>
        <td>${footageCell}</td>
      </tr>
    `;
  }).join('');
}

function renderCharts(summary) {
  const typeCtx = document.getElementById('accidentTypeChart');
  const survivalCtx = document.getElementById('survivalRateChart');

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
    options: { plugins: { legend: { labels: { color: '#dee5f3' } } } },
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
    options: {
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#dee5f3' } },
        x: { ticks: { color: '#dee5f3' } },
      },
      plugins: { legend: { labels: { color: '#dee5f3' } } },
    },
  });
}

async function loadSummary() {
  if (!activeApiBase) {
    analysisResult.classList.remove('hidden');
    analysisResult.textContent = 'Backend not detected. Showing demo analytics. Run `cd backend-node && npm install && npm run dev`.';
    renderTable(mockReports);
    renderCharts(mockSummary);
    return;
  }

  const [reports, summary] = await Promise.all([
    apiRequest('/reports'),
    apiRequest('/summary'),
  ]);

  renderTable(reports);
  renderCharts(summary);
}

(async function boot() {
  await probeApiBase();
  await loadSummary();
})();
