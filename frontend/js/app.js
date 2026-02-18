const apiBase = '/api';

const analyzeForm = document.getElementById('analyzeForm');
const alertForm = document.getElementById('alertForm');
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');
const analysisResult = document.getElementById('analysisResult');
const alertStatus = document.getElementById('alertStatus');
const reportsBody = document.querySelector('#reportsTable tbody');

let typeChart;
let survivalChart;

videoInput.addEventListener('change', () => {
  const [file] = videoInput.files;
  if (!file) return;
  videoPreview.src = URL.createObjectURL(file);
});

analyzeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(analyzeForm);

  analysisResult.classList.remove('hidden');
  analysisResult.textContent = 'Analyzing video...';

  try {
    const response = await fetch(`${apiBase}/analyze`, {
      method: 'POST',
      body: formData
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to analyze');

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
    const response = await fetch(`${apiBase}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Alert failed');

    alertStatus.classList.remove('hidden');
    alertStatus.innerHTML = `Authority notified: <b>${payload.alert.authorityContact}</b> at ${new Date(payload.alert.notifiedAt).toLocaleString()}`;
    await loadSummary();
  } catch (err) {
    alertStatus.classList.remove('hidden');
    alertStatus.textContent = err.message;
  }
});

function renderTable(reports) {
  reportsBody.innerHTML = reports.map((r) => `
    <tr>
      <td>${r.incidentId}</td>
      <td>${new Date(r.timestamp).toLocaleString()}</td>
      <td>${r.location}</td>
      <td>${r.severity}</td>
      <td>${r.survivalRate}%</td>
      <td>${(r.preventiveMeasures || '-').slice(0, 40)} / ${(r.remedialMeasures || '-').slice(0, 40)}</td>
      <td>${r.videoFilename ? `<a href="/uploads/${r.videoFilename}" target="_blank">View</a>` : '-'}</td>
    </tr>
  `).join('');
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
    options: { plugins: { legend: { labels: { color: '#dee5f3' } } } }
  });

  survivalChart = new Chart(survivalCtx, {
    type: 'bar',
    data: {
      labels: ['Average Survival Rate', 'Critical Cases'],
      datasets: [{
        label: 'Percentage',
        data: [summary.averageSurvivalRate, summary.criticalRate],
        backgroundColor: ['#4ecdc4', '#ff6b6b']
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { color: '#dee5f3' } },
        x: { ticks: { color: '#dee5f3' } }
      },
      plugins: { legend: { labels: { color: '#dee5f3' } } }
    }
  });
}

async function loadSummary() {
  const [reportsRes, summaryRes] = await Promise.all([
    fetch(`${apiBase}/reports`),
    fetch(`${apiBase}/summary`)
  ]);

  const reports = await reportsRes.json();
  const summary = await summaryRes.json();

  renderTable(reports);
  renderCharts(summary);
}

loadSummary().catch((err) => {
  analysisResult.classList.remove('hidden');
  analysisResult.textContent = `Failed to load dashboard: ${err.message}`;
});
