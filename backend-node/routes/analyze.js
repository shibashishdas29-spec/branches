import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { addReport } from '../services/reportStore.js';
import { runAnalysis } from '../services/analyzerClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage });

export const analyzeRouter = express.Router();

analyzeRouter.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Video is required' });

    const location = req.body.location || 'Unknown';
    const simulationMode = req.body.simulationMode || 'live-upload';
    const analysis = await runAnalysis(req.file.path, location, simulationMode);

    const report = addReport({
      incidentId: `INC-${uuidv4().slice(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      location,
      simulationMode,
      severity: analysis.severity,
      speedRisk: analysis.speed_risk,
      damageClass: analysis.damage_class,
      survivalRate: analysis.survival_rate,
      detections: analysis.detections,
      preventiveMeasures: '',
      remedialMeasures: '',
      videoFilename: path.basename(req.file.path),
      reviewSummary: analysis.review_summary,
    });

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
