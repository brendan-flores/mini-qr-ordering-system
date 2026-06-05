-- Run on existing Railway / local DB after pulling device-bound QR changes.
USE mini_qr_ordering;

CREATE TABLE IF NOT EXISTS qr_access_bindings (
  access_jti CHAR(36) NOT NULL PRIMARY KEY,
  table_number VARCHAR(32) NOT NULL,
  device_id VARCHAR(64) NOT NULL,
  bound_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qr_access_device (device_id)
);
