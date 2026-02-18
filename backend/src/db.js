const { Client } = require('pg');
const { MongoClient } = require('mongodb');

const pgClient = new Client({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/sentinelcrash',
});

const mongoClient = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017');

let pgConnected = false;
let mongoConnected = false;

async function connectDatabases() {
  try {
    await pgClient.connect();
    pgConnected = true;
    console.log('PostgreSQL connected');
  } catch (error) {
    console.warn('PostgreSQL unavailable, continuing in JSON mode:', error.message);
  }

  try {
    await mongoClient.connect();
    mongoConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB unavailable, continuing in JSON mode:', error.message);
  }
}

module.exports = {
  connectDatabases,
  pgClient,
  mongoClient,
  isPgConnected: () => pgConnected,
  isMongoConnected: () => mongoConnected,
};
