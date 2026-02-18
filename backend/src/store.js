const fs = require('fs');
const path = require('path');
const { pgClient, mongoClient, isPgConnected, isMongoConnected } = require('./db');

const dbPath = path.join(__dirname, '..', 'data', 'records.json');

function readLocalData() {
  if (!fs.existsSync(dbPath)) return { analyses: [], alerts: [] };
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function writeLocalData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

async function saveAnalysis(record) {
  const data = readLocalData();
  data.analyses.push(record);
  writeLocalData(data);

  if (isPgConnected()) {
    await pgClient.query(
      'INSERT INTO accident_events (id, timestamp, location, severity, risk_status, speed_alert, raw_payload) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [record.id, record.dateTime, record.location, record.severity.level, record.riskStatus, record.speedAlert, JSON.stringify(record)],
    );
  }

  if (isMongoConnected()) {
    const collection = mongoClient.db('sentinelcrash').collection('analyses');
    await collection.insertOne(record);
  }
}

async function saveAlert(alert) {
  const data = readLocalData();
  data.alerts.push(alert);
  writeLocalData(data);

  if (isMongoConnected()) {
    const collection = mongoClient.db('sentinelcrash').collection('alerts');
    await collection.insertOne(alert);
  }
}

function getAll() {
  return readLocalData();
}

module.exports = {
  saveAnalysis,
  saveAlert,
  getAll,
};
