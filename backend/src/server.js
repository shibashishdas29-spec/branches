const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { connectDatabases } = require('./db');
const { saveAnalysis, saveAlert, getAll } = require('./store');
const { runPythonAnalyzer } = require('./analyzer');

const app = express();
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));
app.use('/uploads', express.static(uploadDir));

app.post('/api/analyze', upload.single('video'), async (req, res) => {
  try {
    const id = uuidv4();
    const metadata = {
      location: req.body.location,
      speedLimit: Number(req.body.speedLimit),
      reportType: req.body.reportType,
    };

    const pyResult = await runPythonAnalyzer(req.file.path, metadata);

    const result = {
      id,
      ...pyResult,
      dateTime: new Date().toISOString(),
      location: metadata.location,
      reportType: metadata.reportType,
      speedLimit: metadata.speedLimit,
      footageUrl: `/uploads/${path.basename(req.file.path)}`,
    };

    await saveAnalysis(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/authorities/alert', async (req, res) => {
  try {
    const { analysisId, authorityName, authorityEmail, immediateMeasures } = req.body;
    const { analyses } = getAll();
    const analysis = analyses.find((item) => item.id === analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found' });
    }

    const review = {
      id: uuidv4(),
      analysisId,
      authorityName,
      authorityEmail,
      dateTime: new Date().toISOString(),
      place: analysis.location,
      damageClassification: analysis.damageClassification,
      preventiveMeasures: analysis.preventiveMeasures,
      remedialMeasures: immediateMeasures || analysis.remedialMeasures,
      footageUrl: analysis.footageUrl,
    };

    await saveAlert(review);
    res.json({ message: 'Alert dispatched', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/summary', (req, res) => {
  const { analyses } = getAll();

  const severityDistribution = analyses.reduce(
    (acc, item) => {
      acc[item.severity.level] = (acc[item.severity.level] || 0) + 1;
      return acc;
    },
    { Low: 0, Medium: 0, High: 0 },
  );

  const observations = analyses
    .slice(-10)
    .reverse()
    .map((item) => ({
      date: new Date(item.dateTime).toLocaleDateString(),
      location: item.location,
      severity: item.severity.level,
      damageEstimate: item.damageClassification,
      survivalRate: item.survivalRate,
      observation: item.observation,
    }));

  res.json({ severityDistribution, observations });
});

app.get('/api/simulations', (req, res) => {
  const simulationPath = path.join(__dirname, '..', 'data', 'simulation-feeds.json');
  const data = JSON.parse(fs.readFileSync(simulationPath, 'utf-8'));
  res.json(data);
});

const port = Number(process.env.PORT || 3000);
connectDatabases().then(() => {
  app.listen(port, () => {
    console.log(`SentinelCrash backend listening on http://localhost:${port}`);
  });
});
