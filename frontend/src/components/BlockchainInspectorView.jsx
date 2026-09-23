import React from 'react';
import { ShieldCheck, Cpu, Database, ExternalLink, Code, Layers } from 'lucide-react';

export default function BlockchainInspectorView({ systemStatus, records }) {
  const bcDetails = systemStatus?.blockchainDetails || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Contract & Network Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">Solidity Smart Contract Inspector</h2>
            </div>
            <p className="text-xs text-slate-400">
              Contract Name: <span className="font-mono text-cyan-300">IoTDataProvenance.sol</span> | Network: Hardhat Local (Chain ID {bcDetails.chainId || 31337})
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-slate-500">Contract Address:</span>
            <span className="text-cyan-400 font-bold">{bcDetails.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span>
          </div>
        </div>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        
        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-slate-500 uppercase text-[10px] block">RPC Provider Endpoint</span>
          <span className="text-sm font-bold text-slate-200 mt-1 block">{bcDetails.rpcUrl || 'http://127.0.0.1:8545'}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-slate-500 uppercase text-[10px] block">Current Hardhat Block Number</span>
          <span className="text-sm font-bold text-cyan-400 mt-1 block">#{bcDetails.latestBlock || 0}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-slate-500 uppercase text-[10px] block">Total Proofs Anchored</span>
          <span className="text-sm font-bold text-emerald-400 mt-1 block">{bcDetails.totalProofsAnchored || 0} Proofs</span>
        </div>

      </div>

      {/* On-Chain Anchors Explorer Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>On-Chain Provenance Anchors Explorer</span>
          </h3>
          <p className="text-xs text-slate-400">Cryptographic proof records stored on the IoTDataProvenance smart contract</p>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No on-chain proofs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] text-slate-400 uppercase border-b border-slate-800">
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Block #</th>
                  <th className="py-3 px-4">Transaction Hash</th>
                  <th className="py-3 px-4">Anchored SHA-256 Hash</th>
                  <th className="py-3 px-4">Device ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition">
                    
                    <td className="py-3 px-4 font-bold text-slate-200">
                      #{rec.id}
                    </td>

                    <td className="py-3 px-4 text-cyan-400">
                      #{rec.block_number || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {rec.transaction_hash ? (
                        <span title={rec.transaction_hash}>
                          {rec.transaction_hash.substring(0, 14)}...{rec.transaction_hash.substring(rec.transaction_hash.length - 8)}
                        </span>
                      ) : (
                        <span className="text-slate-600">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-cyan-300 font-bold text-[11px]">
                      {rec.data_hash ? (
                        <span title={rec.data_hash}>
                          {rec.data_hash.substring(0, 14)}...{rec.data_hash.substring(rec.data_hash.length - 8)}
                        </span>
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {rec.device_id}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
