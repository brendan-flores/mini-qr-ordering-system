-- Run on existing Railway / local DB after pulling device-bound QR changes.
USE mini_qr_ordering;

CREATE TABLE IF NOT EXISTS qr_scan_codes (
  scan_code CHAR(12) NOT NULL PRIMARY KEY,
  table_number VARCHAR(32) NOT NULL,
  access_jti CHAR(36) NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qr_scan_jti (access_jti)
);

CREATE TABLE IF NOT EXISTS qr_access_bindings (
  access_jti CHAR(36) NOT NULL PRIMARY KEY,
  table_number VARCHAR(32) NOT NULL,
  device_id VARCHAR(64) NOT NULL,
  bound_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qr_access_device (device_id)
);
