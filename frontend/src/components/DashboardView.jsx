import React, { useState } from 'react';
import { 
  Database, ShieldCheck, CheckCircle2, AlertTriangle, 
  Play, RefreshCw, Cpu, Flame, ExternalLink, ArrowRight 
} from 'lucide-react';
import PipelineBanner from './PipelineBanner';

export default function DashboardView({ 
  systemStatus, 
  records, 
  onRecordNewData, 
  onNavigateToVerify, 
  onNavigateToTamper,
  loading 
}) {
  const [selectedDeviceId, setSelectedDeviceId] = useState('ENV_SENSOR_001');
  const metrics = systemStatus?.metrics || { totalRecords: 0, totalProofs: 0, verifiedCount: 0, tamperedCount: 0 };

  return (
    <div className="space-y-6">
      
      {/* Hero Pipeline Architecture Flow */}
      <PipelineBanner />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Records */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Off-Chain Records</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{metrics.totalRecords}</span>
            <span className="text-xs text-slate-400">Stored in SQLite</span>
          </div>
        </div>

        {/* Anchored Proofs */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Blockchain Anchors</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">{metrics.totalProofs}</span>
            <span className="text-xs text-slate-400">On Hardhat Node</span>
          </div>
        </div>

        {/* Verified Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Verified Intact</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{metrics.verifiedCount}</span>
            <span className="text-xs text-emerald-500 font-medium">Authentic</span>
          </div>
        </div>

        {/* Tampered Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tamper Detected</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">{metrics.tamperedCount}</span>
            <span className="text-xs text-rose-400 font-medium">Integrity Mismatches</span>
          </div>
        </div>

      </div>

      {/* Live Sensor Simulation Action Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              VIRTUAL SENSOR ACTIVE
            </span>
            <h3 className="text-lg font-bold text-slate-100">Simulated IoT Environmental Node</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Clicking <b>"Generate & Anchor Reading"</b> runs a smooth random walk sensor generator, computes a deterministic canonical SHA-256 hash, stores the sensor record off-chain in SQLite, and submits an immutable proof transaction to the Hardhat smart contract.
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <select 
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ENV_SENSOR_001">Station Alpha (ENV_SENSOR_001)</option>
            <option value="ENV_SENSOR_002">Station Beta (ENV_SENSOR_002)</option>
          </select>

          <button
            onClick={() => onRecordNewData(selectedDeviceId)}
            disabled={loading}
            className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>Generate & Anchor Reading</span>
          </button>
        </div>

      </div>

      {/* Recent Sensor Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Recent Off-Chain Sensor Records</span>
              <span className="text-xs text-slate-500 font-mono">({records.length} records)</span>
            </h3>
            <p className="text-xs text-slate-400">Recorded off-chain in SQLite with hardhat blockchain transaction anchors</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Cpu className="w-12 h-12 mx-auto mb-3 text-slate-700 stroke-1" />
            <p className="text-sm font-medium">No sensor records found yet.</p>
            <p className="text-xs mt-1">Click "Generate & Anchor Reading" above to create your first record!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Temperature</th>
                  <th className="py-3 px-4">Humidity</th>
                  <th className="py-3 px-4">SHA-256 Hash</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {records.map((rec) => {
                  const isTampered = rec.is_tampered === 1;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-900/50 transition font-mono">
                      
                      <td className="py-3 px-4 font-bold text-slate-300">
                        #{rec.id}
                      </td>

                      <td className="py-3 px-4 text-cyan-400">
                        {rec.device_id}
                      </td>

                      <td className={`py-3 px-4 font-bold ${isTampered ? 'text-rose-400' : 'text-slate-200'}`}>
                        {rec.temperature}°C
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {rec.humidity}%
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {rec.data_hash ? (
                          <span title={rec.data_hash}>
                            {rec.data_hash.substring(0, 10)}...{rec.data_hash.substring(rec.data_hash.length - 8)}
                          </span>
                        ) : (
                          <span className="text-slate-600">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isTampered ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>TAMPERED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>AUTHENTIC</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => onNavigateToVerify(rec.id)}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition text-[11px] font-sans font-medium"
                        >
                          Verify Audit
                        </button>
                        
                        <button
                          onClick={() => onNavigateToTamper(rec.id)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-[11px] font-sans font-medium"
                        >
                          Tamper Demo
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
