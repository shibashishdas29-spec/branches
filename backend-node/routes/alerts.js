import express from 'express';
import { updateReport } from '../services/reportStore.js';

export const alertsRouter = express.Router();

alertsRouter.post('/', (req, res) => {
  const { incidentId, authorityContact, preventiveMeasures, remedialMeasures } = req.body;

  if (!incidentId || !authorityContact) {
    return res.status(400).json({ error: 'incidentId and authorityContact are required' });
  }

  const updated = updateReport(incidentId, {
    authorityContact,
    preventiveMeasures,
    remedialMeasures,
    notifiedAt: new Date().toISOString(),
  });

  if (!updated) return res.status(404).json({ error: 'Incident not found' });

  res.json({
    alert: {
      incidentId,
      authorityContact,
      preventiveMeasures,
      remedialMeasures,
      notifiedAt: updated.notifiedAt,
      status: 'Dispatched',
    }
  });
});
