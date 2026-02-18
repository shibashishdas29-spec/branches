const apiBase = '/api';
const videoInput = document.getElementById('videoInput');
const previewVideo = document.getElementById('previewVideo');
const analyzeForm = document.getElementById('analyzeForm');
const authorityForm = document.getElementById('authorityForm');
const themeToggle = document.getElementById('themeToggle');

const riskStatus = document.getElementById('riskStatus');
const collisionObjects = document.getElementById('collisionObjects');
const severityLabel = document.getElementById('severityLabel');
const speedAlert = document.getElementById('speedAlert');
const reviewList = document.getElementById('reviewList');
const tableBody = document.querySelector('#observationTable tbody');

let latestResult = null;

videoInput.addEventListener('change', () => {
  const file = videoInput.files[0];
  if (file) previewVideo.src = URL.createObjectURL(file);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

analyzeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = videoInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('video', file);
  formData.append('location', document.getElementById('locationInput').value);
  formData.append('speedLimit', document.getElementById('speedLimitInput').value);
  formData.append('reportType', document.getElementById('reportType').value);

  riskStatus.textContent = 'Analyzing with YOLOv5 + OpenCV...';
  try {
    const response = await fetch(`${apiBase}/analyze`, { method: 'POST', body: formData });
    const data = await response.json();
    latestResult = data;

    riskStatus.textContent = data.riskStatus;
    collisionObjects.textContent = data.detectedObjects.join(', ');
    severityLabel.textContent = `${data.severity.level} (${data.severity.score}%)`;
    speedAlert.textContent = data.speedAlert;

    await refreshSummaries();
  } catch (error) {
    riskStatus.textContent = 'Analysis failed. Check backend setup.';
  }
});

authorityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!latestResult) return alert('Run analysis before generating authority report.');

  const payload = {
    authorityName: document.getElementById('authorityName').value,
    authorityEmail: document.getElementById('authorityEmail').value,
    immediateMeasures: document.getElementById('incidentNotes').value,
    analysisId: latestResult.id,
  };

  const response = await fetch(`${apiBase}/authorities/alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  reviewList.innerHTML = `
    <li>Date/Time: ${data.review.dateTime}</li>
    <li>Place: ${data.review.place}</li>
    <li>Damage Classification: ${data.review.damageClassification}</li>
    <li>Preventive Measures: ${data.review.preventiveMeasures}</li>
    <li>Remedial Measures: ${data.review.remedialMeasures}</li>
    <li>Footage Attachment: <a href="${data.review.footageUrl}" target="_blank" rel="noreferrer">View footage</a></li>
  `;

  await refreshSummaries();
});

async function refreshSummaries() {
  const response = await fetch(`${apiBase}/reports/summary`);
  const data = await response.json();

  tableBody.innerHTML = data.observations
    .map(
      (item) => `
      <tr>
        <td>${item.date}</td>
        <td>${item.location}</td>
        <td>${item.severity}</td>
        <td>${item.damageEstimate}</td>
        <td>${item.survivalRate}</td>
        <td>${item.observation}</td>
      </tr>
    `,
    )
    .join('');

  renderCharts(data);
}

let severityChart;
let survivalChart;

function renderCharts(data) {
  const severityCtx = document.getElementById('severityChart');
  const survivalCtx = document.getElementById('survivalChart');

  severityChart?.destroy();
  survivalChart?.destroy();

  severityChart = new Chart(severityCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(data.severityDistribution),
      datasets: [{
        label: 'Accidents by Severity',
        data: Object.values(data.severityDistribution),
        backgroundColor: ['#6ba8ff', '#3dd6a7', '#ff7b7b'],
      }],
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#9ba6b2' } } } },
  });

  survivalChart = new Chart(survivalCtx, {
    type: 'line',
    data: {
      labels: data.observations.map((row) => row.date),
      datasets: [{
        label: 'Survival Rate %',
        data: data.observations.map((row) => row.survivalRate),
        borderColor: '#3dd6a7',
        backgroundColor: 'rgba(61, 214, 167, 0.15)',
        fill: true,
      }],
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#9ba6b2' } } } },
  });
}

refreshSummaries();
