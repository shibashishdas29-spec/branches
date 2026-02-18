import express from 'express';
import { getReports } from '../services/reportStore.js';

export const reportsRouter = express.Router();

reportsRouter.get('/', (_req, res) => {
  res.json(getReports());
});
