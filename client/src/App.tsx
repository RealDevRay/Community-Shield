import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Stats from './components/Stats';
import LiveFeedTicker from './components/LiveFeedTicker';
import AnalyticsView from './components/AnalyticsView';
import ReportsView from './components/ReportsView';
import AlertsView from './components/AlertsView';
import SettingsView from './components/SettingsView';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Types
interface Incident {
  id: string;
  type: string;
  description: string;
  lat: number;
  lng: number;
  severity: string;
  status: string;
}

interface Unit {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'reports' | 'alerts' | 'settings'>('dashboard');
  const [zoomTarget, setZoomTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  const fetchData = async () => {
    try {
      const [incidentsRes, unitsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/incidents'),
        axios.get('http://localhost:8000/api/units'),
        axios.get('http://localhost:8000/api/logs')
      ]);

      setIncidents(incidentsRes.data);
      setUnits(unitsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const dispatchAllUnits = async () => {
    try {
      await axios.post('http://localhost:8000/api/dispatch');
      toast.success('🚔 All units dispatched to nearest incidents!');
      fetchData();
    } catch (error) {
      console.error("Error dispatching units:", error);
      toast.error('❌ Failed to dispatch units');
    }
  };

  const activateEmergency = async () => {
    try {
      await axios.post('http://localhost:8000/api/emergency');
      toast.error('🚨 EMERGENCY PROTOCOL ACTIVATED!', {
        duration: 5000,
        style: {
          background: '#dc2626',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      });
      fetchData();
    } catch (error) {
      console.error("Error activating emergency:", error);
    }
  };

  const zoomToLocation = async (location: string) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/map/zoom/${location}`);
      const { lat, lng, zoom } = response.data;
      setZoomTarget({ lat, lng, zoom });
      console.log(`Zooming to ${location}:`, { lat, lng, zoom });
    } catch (error) {
      console.error(`Error zooming to ${location}:`, error);
    }
  };

  // Keyboard shortcuts (after function definitions)
  useKeyboardShortcuts([
    { key: 'd', action: dispatchAllUnits, description: 'Dispatch all units' },
    { key: 'e', action: activateEmergency, description: 'Emergency protocol' },
    { key: '1', action: () => setCurrentView('dashboard'), description: 'Go to Dashboard' },
    { key: '2', action: () => setCurrentView('analytics'), description: 'Go to Analytics' },
    { key: '3', action: () => setCurrentView('reports'), description: 'Go to Reports' },
    { key: '4', action: () => setCurrentView('alerts'), description: 'Go to Alerts' },
    { key: '5', action: () => setCurrentView('settings'), description: 'Go to Settings' },
  ]);

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-200 selection:text-cyan-900 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="relative z-10 px-8 py-5 flex justify-between items-center bg-white border-b border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text">COMMUNITY SHIELD</span>
            </h1>
            <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200 tracking-widest">
                    AI-POWERED
                </span>
                <p className="text-slate-500 text-xs tracking-widest uppercase">Predictive Policing System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">System Status</div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-bold">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    OPERATIONAL
                </div>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Current Time</div>
                <div className="text-xl font-mono font-bold text-slate-700">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col overflow-hidden bg-slate-50">
          
          {/* Live Feed Ticker - Only on Dashboard */}
          {currentView === 'dashboard' && <LiveFeedTicker logs={logs} />}
          
          <div className="flex-1 p-6 overflow-hidden">
          {/* Dashboard Layout: Split View */}
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
                {/* Left Panel: Stats & Controls - Scrollable */}
                <div className="lg:col-span-4 xl:col-span-3 h-full flex flex-col gap-4 overflow-y-auto pr-2">
                    {/* Stats - Top */}
                    <div className="flex-shrink-0">
                        <Stats incidentCount={incidents.length} unitCount={units.filter(u => u.status !== 'Idle').length} />
                    </div>

                    {/* Control Panel - Bottom */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            ⚡ Command Center
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button 
                                onClick={dispatchAllUnits}
                                title="Dispatch all idle units to nearest active incidents"
                                className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-bold py-3 rounded transition-all hover:shadow-md active:scale-95"
                            >
                                🚔 DISPATCH ALL
                            </button>
                            <button 
                                onClick={activateEmergency}
                                title="Activate emergency protocol - alerts all units and command staff"
                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold py-3 rounded transition-all hover:shadow-md active:scale-95"
                            >
                                🚨 EMERGENCY
                            </button>
                        </div>
                        
                        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                            <h4 className="text-slate-400 font-bold uppercase tracking-wider mb-2">Hotspot Risk</h4>
                            <div className="flex justify-between">
                                <span className="text-slate-400">AI Confidence:</span>
                                <span className="text-green-600 font-bold">94%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Response Time:</span>
                                <span className="text-blue-600 font-bold">2.3s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Map */}
                <div className="lg:col-span-8 xl:col-span-9 h-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative group bg-white">
                    <Map incidents={incidents} units={units} zoomTarget={zoomTarget} />
                    
                    {/* Map Overlays - Top Right */}
                    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur p-2 rounded-lg border border-slate-200 shadow-lg">
                            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Quick Zoom</div>
                            <div className="grid grid-cols-2 gap-1">
                                {['CBD', 'Westlands', 'Karen', 'Kibera'].map(loc => (
                                    <button 
                                        key={loc}
                                        onClick={() => zoomToLocation(loc.toLowerCase())}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1 px-2 rounded transition-colors"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur p-4 rounded-lg border border-slate-200 shadow-lg">
                        <h4 className="text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">Legend</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-slate-600">Incident</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-slate-600">Patrol Unit</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div><span className="text-slate-600">Hotspot</span></div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* Full Width Views */}
          {currentView === 'analytics' && (
            <div className="h-full w-full overflow-y-auto">
                <AnalyticsView />
            </div>
          )}

          {currentView === 'reports' && (
            <div className="h-full w-full overflow-y-auto">
                <ReportsView />
            </div>
          )}

          {currentView === 'alerts' && (
            <div className="h-full w-full overflow-y-auto">
                <AlertsView />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="h-full w-full overflow-y-auto">
                <SettingsView />
            </div>
          )}
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
