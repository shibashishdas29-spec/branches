CREATE TABLE IF NOT EXISTS accident_events (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  severity TEXT NOT NULL,
  risk_status TEXT NOT NULL,
  speed_alert TEXT,
  raw_payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accident_events_timestamp ON accident_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_accident_events_severity ON accident_events (severity);
