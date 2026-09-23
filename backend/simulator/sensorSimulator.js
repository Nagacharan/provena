/**
 * Simulated IoT Environmental Sensor Generator.
 * Simulates virtual physical sensors with continuous, realistic random walk readings
 * (avoiding unrealistic spikes or abrupt jumps).
 */
class SensorSimulator {
  constructor() {
    this.devices = {
      'ENV_SENSOR_001': {
        temperature: 24.5,
        humidity: 58.2,
        sequence: 1001
      },
      'ENV_SENSOR_002': {
        temperature: 21.8,
        humidity: 62.4,
        sequence: 2001
      }
    };
  }

  /**
   * Generates a single new reading for a device ID with smooth realistic changes.
   * @param {string} deviceId 
   * @returns {Object} Sensor reading object
   */
  generateReading(deviceId = 'ENV_SENSOR_001') {
    if (!this.devices[deviceId]) {
      this.devices[deviceId] = {
        temperature: 23.0,
        humidity: 50.0,
        sequence: 3001
      };
    }

    const state = this.devices[deviceId];

    // Smooth random walk (-0.3 to +0.3 for temperature, -0.6 to +0.6 for humidity)
    const tempDelta = (Math.random() - 0.5) * 0.6;
    const humidityDelta = (Math.random() - 0.5) * 1.2;

    // Clamp to realistic physical room boundaries
    state.temperature = Math.max(15.0, Math.min(42.0, state.temperature + tempDelta));
    state.humidity = Math.max(25.0, Math.min(95.0, state.humidity + humidityDelta));
    state.sequence += 1;

    return {
      device_id: deviceId,
      temperature: Number(state.temperature.toFixed(2)),
      humidity: Number(state.humidity.toFixed(2)),
      timestamp: new Date().toISOString(),
      sequence: state.sequence
    };
  }

  /**
   * Gets current state snapshot of all simulated devices.
   */
  getDeviceStates() {
    return this.devices;
  }
}

module.exports = new SensorSimulator();
