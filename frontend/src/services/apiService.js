// Use production VITE_API_URL environment variable when available, fallback to local proxy '/api'
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api';

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error('Failed to fetch devices');
  return res.json();
}

export async function generateSensorReading(deviceId = 'ENV_SENSOR_001') {
  const res = await fetch(`${API_BASE}/sensor-data/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId })
  });
  if (!res.ok) throw new Error('Failed to generate reading');
  return res.json();
}

export async function recordSensorReading(reading = null, deviceId = 'ENV_SENSOR_001') {
  const res = await fetch(`${API_BASE}/sensor-data/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reading, deviceId })
  });
  if (!res.ok) throw new Error('Failed to record reading');
  return res.json();
}

export async function fetchAllSensorData(limit = 50) {
  const res = await fetch(`${API_BASE}/sensor-data?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch sensor data');
  return res.json();
}

export async function fetchProvenanceDetail(id) {
  const res = await fetch(`${API_BASE}/provenance/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch provenance for record #${id}`);
  return res.json();
}

export async function verifySensorRecord(id) {
  const res = await fetch(`${API_BASE}/verify/${id}`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Verification failed for record #${id}`);
  }
  return res.json();
}

export async function tamperSensorRecord(id, newTemperature = null, newHumidity = null) {
  const res = await fetch(`${API_BASE}/tamper/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newTemperature, newHumidity })
  });
  if (!res.ok) throw new Error(`Tampering request failed for record #${id}`);
  return res.json();
}
