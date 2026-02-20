-- Local WordPress import SQL dump for Accident Prevention System
-- This file is intentionally lightweight and portable.
-- Import into your Local site's database after creating the WordPress site.

CREATE TABLE IF NOT EXISTS wp_accident_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  incident_id VARCHAR(64) NOT NULL,
  reported_at DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  survival_rate DECIMAL(5,2) NOT NULL,
  preventive_measures TEXT,
  remedial_measures TEXT,
  PRIMARY KEY (id),
  UNIQUE KEY incident_id (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO wp_accident_reports
(incident_id, reported_at, location, severity, survival_rate, preventive_measures, remedial_measures)
VALUES
('WP-SIM-1001', NOW(), 'City Ring Road - Camera C12', 'Moderate', 82.00, 'Adaptive speed signage', 'Dispatch alerted and lane secured')
ON DUPLICATE KEY UPDATE
severity = VALUES(severity),
survival_rate = VALUES(survival_rate),
preventive_measures = VALUES(preventive_measures),
remedial_measures = VALUES(remedial_measures);
