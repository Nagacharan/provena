import React, { useState, useEffect } from 'react';
import { Cpu, Play, Pause, RefreshCw, Zap, Activity } from 'lucide-react';
import { generateSensorReading, recordSensorReading } from '../services/apiService';

export default function SimulatorControlView({ onRefreshAll }) {
  const [deviceId, setDeviceId] = useState('ENV_SENSOR_001');
  const [currentReading, setCurrentReading] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingHistory, setReadingHistory] = useState([]);

  useEffect(() => {
    fetchSingleReading();
  }, [deviceId]);

  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const res = await recordSensorReading(null, deviceId);
          setCurrentReading(res.record);
          setReadingHistory(prev => [res.record, ...prev.slice(0, 9)]);
          if (onRefreshAll) onRefreshAll();
        } catch (err) {
          console.error('Simulation step error:', err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, deviceId]);

  async function fetchSingleReading() {
    setLoading(true);
    try {
      const data = await generateSensorReading(deviceId);
      setCurrentReading(data.reading);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAndRecord() {
    setLoading(true);
    try {
      const res = await recordSensorReading(null, deviceId);
      setCurrentReading(res.record);
      setReadingHistory(prev => [res.record, ...prev.slice(0, 9)]);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Simulator Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-slate-900/80 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Simulated IoT Sensor Control Panel</h2>
              <p className="text-xs text-slate-400">Virtual environmental multi-sensor generating temperature, humidity, and sequence data</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ENV_SENSOR_001">Station Alpha (ENV_SENSOR_001)</option>
              <option value="ENV_SENSOR_002">Station Beta (ENV_SENSOR_002)</option>
            </select>
          </div>
        </div>

        {/* Live Telemetry Display */}
        {currentReading && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Device ID</span>
              <span className="text-sm font-bold text-cyan-400 mt-1 block">{currentReading.device_id || deviceId}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Temperature</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                {currentReading.temperature}°C
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Humidity</span>
              <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
                {currentReading.humidity}%
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Sequence #</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">#{currentReading.sequence}</span>
            </div>

          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          
          <button
            onClick={handleGenerateAndRecord}
            disabled={loading || isSimulating}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Generate & Anchor Single Reading</span>
          </button>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
              isSimulating 
                ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Stop Continuous Feed (3s)' : 'Start Continuous Feed (3s)'}</span>
          </button>

        </div>

      </div>

      {/* Simulator Stream History */}
      {readingHistory.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">
            Recent Stream Feed
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {readingHistory.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-slate-300">
                <span className="text-cyan-400 font-bold">#{item.id}</span>
                <span>{item.device_id}</span>
                <span className="text-emerald-400">{item.temperature}°C</span>
                <span className="text-cyan-300">{item.humidity}%</span>
                <span className="text-slate-500 text-[10px]">{new Date(item.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
