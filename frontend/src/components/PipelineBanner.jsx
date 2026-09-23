import React from 'react';
import { Cpu, Hash, Database, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PipelineBanner() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-xl mb-8">
      
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 font-mono flex items-center space-x-2">
            <span>System Provenance & Verification Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Off-chain data storage combined with immutable on-chain cryptographic anchor
          </p>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 rounded-full">
          Standard SHA-256 Protocol
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        
        {/* Step 1: Simulated IoT Device */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center hover:border-cyan-500/40 transition">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Step 1</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5">Simulated IoT Sensor</span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">ENV_SENSOR_001</span>
        </div>

        {/* Step 2: Canonical SHA-256 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center hover:border-purple-500/40 transition">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-2">
            <Hash className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Step 2</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5">Canonical Hashing</span>
          <span className="text-[11px] text-purple-300 mt-1 font-mono">SHA-256 (0x...)</span>
        </div>

        {/* Step 3: Off-Chain Storage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center hover:border-emerald-500/40 transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2">
            <Database className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Step 3 (Off-Chain)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5">SQLite Database</span>
          <span className="text-[11px] text-emerald-300 mt-1 font-mono">Actual Sensor Data</span>
        </div>

        {/* Step 4: On-Chain Anchor */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center hover:border-cyan-500/40 transition">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Step 4 (On-Chain)</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5">Hardhat Blockchain</span>
          <span className="text-[11px] text-cyan-300 mt-1 font-mono">Immutable Proof</span>
        </div>

        {/* Step 5: Verification Engine */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center hover:border-emerald-400/40 transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Step 5</span>
          <span className="text-xs font-semibold text-slate-200 mt-0.5">Verification Engine</span>
          <span className="text-[11px] text-emerald-400 mt-1 font-mono">VERIFIED / TAMPER</span>
        </div>

      </div>

    </div>
  );
}
