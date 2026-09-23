import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import VerificationView from './components/VerificationView';
import TamperingView from './components/TamperingView';
import BlockchainInspectorView from './components/BlockchainInspectorView';
import SimulatorControlView from './components/SimulatorControlView';
import { 
  fetchSystemStatus, fetchAllSensorData, recordSensorReading 
} from './services/apiService';
import { LayoutDashboard, ShieldCheck, Flame, Layers, Cpu, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecordIdForVerify, setSelectedRecordIdForVerify] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [fetchErrorCount, setFetchErrorCount] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling health & stats every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [status, data] = await Promise.all([
        fetchSystemStatus().catch((err) => {
          setFetchErrorCount(prev => prev + 1);
          return null;
        }),
        fetchAllSensorData(50).catch(() => ({ records: [] }))
      ]);

      if (status) {
        setSystemStatus(status);
        setIsWakingUp(false);
        setFetchErrorCount(0);
      } else {
        setIsWakingUp(true);
      }

      if (data?.records) setRecords(data.records);
    } catch (err) {
      console.error('Data loading error:', err);
    }
  }

  async function handleRecordNewData(deviceId = 'ENV_SENSOR_001') {
    setLoading(true);
    try {
      await recordSensorReading(null, deviceId);
      await loadData();
    } catch (err) {
      alert('Error recording sensor data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNavigateToVerify(recordId) {
    setSelectedRecordIdForVerify(recordId);
    setActiveTab('verification');
  }

  function handleNavigateToTamper(recordId) {
    setActiveTab('tampering');
  }

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Fixed Header with Live System Status */}
      <Header systemStatus={systemStatus} />

      {/* Render Free Service Cold-Start Notification Banner */}
      {isWakingUp && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-300 font-mono flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Render backend waking up from spin-down cold start... Retrying connection...</span>
        </div>
      )}

      {/* Main Navigation Tabs Bar */}
      <nav className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-3 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'verification'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verification Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('tampering')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'tampering'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Tamper Demo Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('blockchain')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'blockchain'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Blockchain Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'simulator'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>IoT Simulator Control</span>
            </button>

          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>
      </nav>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            systemStatus={systemStatus}
            records={records}
            onRecordNewData={handleRecordNewData}
            onNavigateToVerify={handleNavigateToVerify}
            onNavigateToTamper={handleNavigateToTamper}
            loading={loading}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationView initialRecordId={selectedRecordIdForVerify} />
        )}

        {activeTab === 'tampering' && (
          <TamperingView onNavigateToVerify={handleNavigateToVerify} />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainInspectorView systemStatus={systemStatus} records={records} />
        )}

        {activeTab === 'simulator' && (
          <SimulatorControlView onRefreshAll={loadData} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Provena • Blockchain-Backed IoT Data Provenance & Integrity System
      </footer>

    </div>
  );
}
