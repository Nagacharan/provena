import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, 
  Database, Hash, Lock, Search, FileText, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { verifySensorRecord, fetchAllSensorData } from '../services/apiService';

export default function VerificationView({ initialRecordId }) {
  const [recordId, setRecordId] = useState(initialRecordId || 1);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (initialRecordId) {
      setRecordId(initialRecordId);
      runVerification(initialRecordId);
    } else if (availableRecords.length > 0) {
      runVerification(availableRecords[0].id);
    }
  }, [initialRecordId]);

  async function loadRecords() {
    try {
      const data = await fetchAllSensorData(50);
      setAvailableRecords(data.records || []);
      if (data.records.length > 0 && !initialRecordId) {
        setRecordId(data.records[0].id);
        runVerification(data.records[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function runVerification(idToVerify = recordId) {
    if (!idToVerify) return;
    setLoading(true);
    setError(null);
    try {
      const result = await verifySensorRecord(idToVerify);
      setVerificationResult(result);
    } catch (err) {
      setError(err.message);
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  }

  const isVerified = verificationResult?.status === 'VERIFIED';
  const isTampered = verificationResult?.status === 'TAMPER_DETECTED';
  const isProofMissing = verificationResult?.status === 'PROOF_NOT_FOUND';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <span>Data Integrity Verification Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Recalculates the deterministic SHA-256 hash from off-chain database values and compares it against the immutable proof stored on the Hardhat smart contract.
            </p>
          </div>

          {/* Record Selector Form */}
          <div className="flex items-center space-x-3">
            <select
              value={recordId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setRecordId(newId);
                runVerification(newId);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {availableRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  Record #{r.id} ({r.device_id} - {r.temperature}°C) {r.is_tampered ? '[TAMPERED]' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => runVerification(recordId)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Verify Integrity</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          ⚠️ Verification Error: {error}
        </div>
      )}

      {/* Verification Status Banner Result */}
      {verificationResult && (
        <div className={`glass-panel p-8 rounded-2xl border text-center transition-all ${
          isVerified 
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-900 glow-green'
            : isTampered 
            ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/40 to-slate-900 glow-red'
            : 'border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-slate-900'
        }`}>
          
          <div className="inline-flex p-4 rounded-full mb-3 shadow-xl">
            {isVerified && (
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-400/50">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            )}
            {isTampered && (
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full border border-rose-400/50 animate-bounce">
                <ShieldAlert className="w-12 h-12" />
              </div>
            )}
            {isProofMissing && (
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-400/50">
                <AlertTriangle className="w-12 h-12" />
              </div>
            )}
          </div>

          <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${
            isVerified ? 'text-emerald-400' : isTampered ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {isVerified && '✓ VERIFIED INTACT'}
            {isTampered && '✕ TAMPER DETECTED'}
            {isProofMissing && '⚠️ PROOF NOT FOUND'}
          </h3>

          <p className="text-xs text-slate-300 max-w-2xl mx-auto mt-2 font-sans">
            {verificationResult.auditReport}
          </p>

          <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Record #{verificationResult.recordId}</span>
            <span>•</span>
            <span>Audited at: {new Date().toLocaleTimeString()}</span>
          </div>

        </div>
      )}

      {/* Detailed Cryptographic Inspection Grid */}
      {verificationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Off-Chain Database Data */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-200">Off-Chain SQLite Database State</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                OFF-CHAIN
              </span>
            </div>

            {/* Current Readings */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Temperature</span>
                <span className={`text-base font-bold ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {verificationResult.record?.temperature}°C
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Humidity</span>
                <span className="text-base font-bold text-slate-200">
                  {verificationResult.record?.humidity}%
                </span>
              </div>
            </div>

            {/* Canonical JSON String */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Deterministic Canonical Serialization:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
                {verificationResult.canonicalRepresentation}
              </div>
            </div>

            {/* Recalculated SHA-256 Hash */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Recalculated SHA-256 Hash:</span>
              <div className={`p-3 rounded-xl border font-mono text-[11px] break-all ${
                isTampered 
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300 font-bold' 
                  : 'bg-slate-950 border-slate-800 text-emerald-400'
              }`}>
                {verificationResult.recalculatedHash}
              </div>
            </div>

          </div>

          {/* Right Column: On-Chain Smart Contract Proof */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-200">On-Chain Smart Contract Proof</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                IMMUTABLE
              </span>
            </div>

            {/* Blockchain Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Block Number</span>
                <span className="text-base font-bold text-cyan-400">
                  #{verificationResult.blockchainMetadata?.blockNumber || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Device ID</span>
                <span className="text-base font-bold text-slate-200">
                  {verificationResult.blockchainMetadata?.deviceId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Transaction Hash */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Transaction Hash:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 break-all">
                {verificationResult.blockchainMetadata?.transactionHash || 'N/A'}
              </div>
            </div>

            {/* Anchored On-Chain Proof Hash */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">On-Chain Anchored Hash:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 font-mono text-[11px] text-cyan-400 font-bold break-all">
                {verificationResult.blockchainHash || 'N/A'}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
