CREATE TABLE IF NOT EXISTS accident_reports (
  incident_id VARCHAR(32) PRIMARY KEY,
  occurred_at TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  simulation_mode VARCHAR(32) NOT NULL,
  severity VARCHAR(16) NOT NULL,
  speed_risk VARCHAR(16) NOT NULL,
  damage_class TEXT NOT NULL,
  survival_rate NUMERIC(5,2) NOT NULL,
  review_summary TEXT,
  authority_contact TEXT,
  preventive_measures TEXT,
  remedial_measures TEXT,
  video_filename TEXT,
  notified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detection_frames (
  id SERIAL PRIMARY KEY,
  incident_id VARCHAR(32) REFERENCES accident_reports(incident_id) ON DELETE CASCADE,
  frame_idx INT NOT NULL,
  collision_score NUMERIC(5,4) NOT NULL,
  objects JSONB NOT NULL
);
