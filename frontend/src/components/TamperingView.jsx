import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Flame, ShieldAlert, ArrowRight, 
  CheckCircle2, RefreshCw, Database, Lock 
} from 'lucide-react';
import { tamperSensorRecord, fetchAllSensorData } from '../services/apiService';

export default function TamperingView({ onNavigateToVerify }) {
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [newTemperature, setNewTemperature] = useState(38.6);
  const [newHumidity, setNewHumidity] = useState(65.0);
  const [tamperResult, setTamperResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const data = await fetchAllSensorData(50);
      setRecords(data.records || []);
      if (data.records.length > 0) {
        const first = data.records[0];
        setSelectedRecordId(first.id);
        setNewTemperature(Number((first.temperature + 10.0).toFixed(2)));
        setNewHumidity(first.humidity);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function handleRecordChange(e) {
    const id = Number(e.target.value);
    setSelectedRecordId(id);
    const selected = records.find(r => r.id === id);
    if (selected) {
      setNewTemperature(Number((selected.temperature + 10.0).toFixed(2)));
      setNewHumidity(selected.humidity);
    }
  }

  async function executeTamper() {
    if (!selectedRecordId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await tamperSensorRecord(selectedRecordId, newTemperature, newHumidity);
      setTamperResult(result);
      await loadRecords(); // reload table state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedRecord = records.find(r => r.id === Number(selectedRecordId));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <span>Controlled Data Tampering Sandbox</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CRITICAL DEMO FEATURE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrates how mutating off-chain database values breaks cryptographic hash alignment while the Hardhat blockchain proof remains 100% immutable.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          ⚠️ Tampering Action Failed: {error}
        </div>
      )}

      {/* Main Sandbox Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Tampering Configuration Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            1. Select Off-Chain Record & Corrupt Values
          </h3>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">Target Sensor Record:</label>
            <select
              value={selectedRecordId}
              onChange={handleRecordChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  Record #{r.id} ({r.device_id}) - Temp: {r.temperature}°C {r.is_tampered ? '[ALREADY TAMPERED]' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedRecord && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Original Temp:</span>
                <span className="text-slate-200 font-bold">{selectedRecord.temperature}°C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Original Humidity:</span>
                <span className="text-slate-200 font-bold">{selectedRecord.humidity}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stored Hash:</span>
                <span className="text-cyan-400 text-[10px]">{selectedRecord.data_hash?.substring(0, 16)}...</span>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-mono text-rose-400 font-bold block mb-1">
                Mutated Temperature Value (°C):
              </label>
              <input
                type="number"
                step="0.1"
                value={newTemperature}
                onChange={(e) => setNewTemperature(Number(e.target.value))}
                className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-4 py-2 text-sm text-rose-300 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Mutated Humidity Value (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={newHumidity}
                onChange={(e) => setNewHumidity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            onClick={executeTamper}
            disabled={loading || !selectedRecordId}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
            <span>Corrupt Off-Chain Database Record</span>
          </button>
        </div>

        {/* Right Side: Step-by-Step Educational Explanation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            2. How Data Tampering Works
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <span className="font-bold text-slate-200 block">Off-Chain vs On-Chain Separation</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Large IoT data is stored off-chain in SQLite for speed and low cost. Only its cryptographic SHA-256 fingerprint resides on the smart contract.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <span className="font-bold text-slate-200 block">Uncontrolled Mutation</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  When a malicious actor modifies the SQLite database (e.g. changing 24.7°C to 38.6°C), the raw data changes.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <span className="font-bold text-slate-200 block">Deterministic Hash Divergence</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Recalculating SHA-256 on the altered data produces a completely new hash value that fails to match the original on-chain proof.
                </p>
              </div>
            </div>

          </div>

          {tamperResult && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3 mt-4">
              <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Tampering Applied to Record #{tamperResult.recordId}!</span>
              </div>

              <div className="text-[11px] font-mono text-slate-300 space-y-1">
                <p>Before: {tamperResult.before.temperature}°C (Hash: {tamperResult.before.dataHash.substring(0, 12)}...)</p>
                <p className="text-rose-300">After: {tamperResult.after.temperature}°C (New Hash: {tamperResult.after.newCalculatedHash.substring(0, 12)}...)</p>
              </div>

              <button
                onClick={() => onNavigateToVerify(tamperResult.recordId)}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow transition"
              >
                <span>Run Verification Audit Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
