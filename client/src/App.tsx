import { useEffect, useState } from 'react';
import axios from 'axios';
import Map from './components/Map';
import LiveFeed from './components/LiveFeed';
import Stats from './components/Stats';
import Sidebar from './components/Sidebar';
import AnalyticsView from './components/AnalyticsView';
import ReportsView from './components/ReportsView';
import AlertsView from './components/AlertsView';

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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast('All units dispatched to nearest incidents', 'success');
      fetchData();
    } catch (error) {
      console.error("Error dispatching units:", error);
      showToast('Failed to dispatch units', 'error');
    }
  };

  const activateEmergency = async () => {
    try {
      await axios.post('http://localhost:8000/api/emergency');
      showToast('EMERGENCY PROTOCOL ACTIVATED', 'error');
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

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-200 selection:text-cyan-900 overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Toast Notification */}
        {toast && (
            <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-xl font-bold text-sm animate-bounce ${
                toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
            }`}>
                {toast.message}
            </div>
        )}

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
        <main className="relative z-10 flex-1 p-6 overflow-hidden bg-slate-50">
          
          {/* Dashboard Layout: Split View */}
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left Panel: Stats & Controls */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
                    <Stats incidentCount={incidents.length} unitCount={units.filter(u => u.status !== 'Idle').length} />
                    
                    <div className="flex-1 min-h-0">
                        <LiveFeed logs={logs} />
                    </div>

                    {/* Control Panel */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            Command Center
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button 
                                onClick={dispatchAllUnits}
                                className="bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 text-xs font-bold py-3 rounded transition-all hover:shadow-md active:scale-95"
                            >
                                DISPATCH ALL
                            </button>
                            <button 
                                onClick={activateEmergency}
                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold py-3 rounded transition-all hover:shadow-md active:scale-95"
                            >
                                EMERGENCY
                            </button>
                        </div>
                        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
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
                    
                    {/* Map Overlays */}
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
            <div className="h-full w-full flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center text-slate-400">
                    <SettingsIcon />
                    <p className="mt-4 font-medium">System Settings</p>
                    <p className="text-sm">Configuration panel coming soon.</p>
                </div>
            </div>
          )}

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
