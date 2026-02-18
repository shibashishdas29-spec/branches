import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'reports.json');

function readReports() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeReports(reports) {
  fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));
}

export function addReport(report) {
  const reports = readReports();
  reports.unshift(report);
  writeReports(reports);
  return report;
}

export function updateReport(incidentId, patch) {
  const reports = readReports();
  const idx = reports.findIndex((r) => r.incidentId === incidentId);
  if (idx === -1) return null;
  reports[idx] = { ...reports[idx], ...patch };
  writeReports(reports);
  return reports[idx];
}

export function getReports() {
  return readReports();
}

export function getSummary() {
  const reports = readReports();
  const total = reports.length || 1;
  const bySeverity = reports.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, { Critical: 0, High: 0, Moderate: 0, Low: 0 });

  const averageSurvivalRate = Number((reports.reduce((s, r) => s + (r.survivalRate || 0), 0) / total).toFixed(2));
  const criticalRate = Number((((bySeverity.Critical || 0) / total) * 100).toFixed(2));

  return { bySeverity, averageSurvivalRate, criticalRate, totalReports: reports.length };
}
