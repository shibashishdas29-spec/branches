import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { analyzeRouter } from './routes/analyze.js';
import { alertsRouter } from './routes/alerts.js';
import { reportsRouter } from './routes/reports.js';
import { summaryRouter } from './routes/summary.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api/analyze', analyzeRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/summary', summaryRouter);

const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
