import express from 'express';
import { getSummary } from '../services/reportStore.js';

export const summaryRouter = express.Router();

summaryRouter.get('/', (_req, res) => {
  res.json(getSummary());
});
