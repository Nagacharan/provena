import React from 'react';
import { Activity, ShieldCheck, Database, Cpu, Lock } from 'lucide-react';

export default function Header({ systemStatus }) {
  const isBackendOnline = systemStatus?.status === 'ONLINE';
  const isDbConnected = systemStatus?.database === 'CONNECTED';
  const isBlockchainConnected = systemStatus?.blockchain === 'CONNECTED';

  return (
    <header className="glass-panel border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Logo & Titles */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-lg shadow-cyan-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                IoT Data Provenance & Verification
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-md">
                Blockchain Integrity
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tamper-evident cryptographic proof anchoring for off-chain IoT sensor data
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          
          {/* Backend Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">API:</span>
            <span className="flex items-center space-x-1.5 font-semibold">
              <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={isBackendOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {isBackendOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </span>
          </div>

          {/* Database Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">SQLite:</span>
            <span className="flex items-center space-x-1.5 font-semibold">
              <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
              <span className={isDbConnected ? 'text-emerald-400' : 'text-rose-400'}>
                {isDbConnected ? 'OFF-CHAIN DB' : 'DISCONNECTED'}
              </span>
            </span>
          </div>

          {/* Hardhat Blockchain Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Hardhat Node:</span>
            <span className="flex items-center space-x-1.5 font-semibold">
              <span className={`w-2 h-2 rounded-full ${isBlockchainConnected ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={isBlockchainConnected ? 'text-cyan-400' : 'text-rose-400'}>
                {isBlockchainConnected ? 'ON-CHAIN' : 'DISCONNECTED'}
              </span>
            </span>
          </div>

        </div>

      </div>
    </header>
  );
}
