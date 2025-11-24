import { useEffect, useState } from 'react';
import axios from 'axios';
import Map from './components/Map';
import LiveFeed from './components/LiveFeed';
import Stats from './components/Stats';
import Sidebar from './components/Sidebar';

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
      // Refresh data after dispatch
      fetchData();
    } catch (error) {
      console.error("Error dispatching units:", error);
    }
  };

  const activateEmergency = async () => {
    try {
      await axios.post('http://localhost:8000/api/emergency');
      // Refresh data after emergency activation
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
    <div className="flex h-screen bg-gray-900 text-white font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 px-8 py-6 flex justify-between items-end border-b border-white/5 bg-gray-900/30 backdrop-blur-sm">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              COMMUNITY SHIELD
            </h1>
            <div className="flex items-center gap-3 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-widest">
                    AI-POWERED
                </span>
                <p className="text-gray-500 text-sm tracking-widest uppercase">Predictive Policing System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500 font-mono mb-1">SYSTEM STATUS</div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-[0_0_5px_#22c55e]"></span>
                    OPERATIONAL
                </div>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-xs text-gray-500 font-mono mb-1">CURRENT TIME</div>
                <div className="text-xl font-mono font-bold text-gray-200">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Panel: Stats & Logs */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            {currentView === 'dashboard' && (
              <>
                <Stats incidentCount={incidents.length} unitCount={units.filter(u => u.status !== 'Idle').length} />
                
                <div className="flex-1 min-h-0">
                  <LiveFeed logs={logs} />
                </div>

                {/* Enhanced Control Panel */}
                <div className="glass-panel p-4 rounded-xl">
                    <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        Command Center
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button 
                          onClick={dispatchAllUnits}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold py-2 rounded transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        >
                            DISPATCH ALL
                        </button>
                        <button 
                          onClick={activateEmergency}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold py-2 rounded transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        >
                            EMERGENCY
                        </button>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">AI Confidence:</span>
                            <span className="text-green-400 font-bold">94%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Response Time:</span>
                            <span className="text-blue-400 font-bold">2.3s</span>
                        </div>
                    </div>
                </div>
              </>
            )}

            {currentView === 'analytics' && (
              <div className="glass-panel p-6 rounded-xl h-full">
                <h3 className="text-cyan-400 text-lg font-bold uppercase tracking-wider mb-4">Analytics Dashboard</h3>
                <div className="space-y-4">
                  <div className="text-center text-gray-400 py-8">
                    <ChartIcon />
                    <p className="mt-2">Advanced analytics and reporting coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'reports' && (
              <div className="glass-panel p-6 rounded-xl h-full">
                <h3 className="text-cyan-400 text-lg font-bold uppercase tracking-wider mb-4">Incident Reports</h3>
                <div className="space-y-4">
                  <div className="text-center text-gray-400 py-8">
                    <ReportIcon />
                    <p className="mt-2">Detailed incident reports and export functionality coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'alerts' && (
              <div className="glass-panel p-6 rounded-xl h-full">
                <h3 className="text-red-400 text-lg font-bold uppercase tracking-wider mb-4">Active Alerts</h3>
                <div className="space-y-4">
                  <div className="text-center text-gray-400 py-8">
                    <AlertIcon />
                    <p className="mt-2">Real-time alert management system coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="glass-panel p-6 rounded-xl h-full">
                <h3 className="text-cyan-400 text-lg font-bold uppercase tracking-wider mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div className="text-center text-gray-400 py-8">
                    <SettingsIcon />
                    <p className="mt-2">System configuration and preferences coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Map (only show on dashboard) */}
          {currentView === 'dashboard' && (
            <div className="lg:col-span-8 xl:col-span-9 h-full rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative group">
              <div className="absolute inset-0 pointer-events-none z-20 border-[1px] border-cyan-500/10 rounded-2xl"></div>
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-2xl z-20"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-2xl z-20"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-2xl z-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-2xl z-20"></div>
              
              <Map incidents={incidents} units={units} zoomTarget={zoomTarget} />
              
              {/* Enhanced Map Overlay UI */}
              <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                  <div className="bg-gray-900/90 backdrop-blur text-xs text-gray-300 px-3 py-2 rounded-lg border border-white/10 shadow-lg">
                      <div className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider mb-1">Current View</div>
                      <div><span className="text-cyan-400 font-bold">LAT:</span> -1.2921</div>
                      <div><span className="text-cyan-400 font-bold">LNG:</span> 36.8219</div>
                  </div>
                  <div className="bg-gray-900/90 backdrop-blur p-2 rounded-lg border border-white/10 shadow-lg">
                      <div className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-2">Quick Zoom</div>
                      <div className="grid grid-cols-2 gap-1">
                          <button 
                            onClick={() => zoomToLocation('cbd')}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-bold py-1 px-2 rounded transition-colors"
                          >
                            CBD
                          </button>
                          <button 
                            onClick={() => zoomToLocation('westlands')}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-bold py-1 px-2 rounded transition-colors"
                          >
                            Westlands
                          </button>
                          <button 
                            onClick={() => zoomToLocation('karen')}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-bold py-1 px-2 rounded transition-colors"
                          >
                            Karen
                          </button>
                          <button 
                            onClick={() => zoomToLocation('kibera')}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-bold py-1 px-2 rounded transition-colors"
                          >
                            Kibera
                          </button>
                      </div>
                  </div>
              </div>

              {/* Enhanced Map Legend */}
              <div className="absolute bottom-4 left-4 z-[400] bg-gray-900/90 backdrop-blur p-4 rounded-lg border border-white/10 shadow-lg">
                  <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3">Map Legend</h4>
                  <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                          <span className="text-gray-300">Active Incidents</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                          <span className="text-gray-300">Police Units</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse"></div>
                          <span className="text-gray-300">Predicted Hotspots</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                          <span className="text-gray-300">Safe Zones</span>
                      </div>
                  </div>
              </div>

              {/* Predictive Analytics Overlay */}
              <div className="absolute top-4 left-4 z-[400] bg-gray-900/90 backdrop-blur p-4 rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] max-w-xs">
                  <h4 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                      AI Predictions
                  </h4>
                  <div className="space-y-3 text-sm">
                      <div className="bg-red-500/10 border border-red-500/20 p-2 rounded">
                          <div className="text-red-400 font-bold text-xs">HIGH RISK</div>
                          <div className="text-gray-300 text-xs">Westlands Mall - 78% probability</div>
                          <div className="text-gray-500 text-[10px] mt-1">Next 2 hours</div>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded">
                          <div className="text-orange-400 font-bold text-xs">MEDIUM RISK</div>
                          <div className="text-gray-300 text-xs">CBD Area - 45% probability</div>
                          <div className="text-gray-500 text-[10px] mt-1">Next 4 hours</div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 p-2 rounded">
                          <div className="text-green-400 font-bold text-xs">LOW RISK</div>
                          <div className="text-gray-300 text-xs">Karen Suburbs - 12% probability</div>
                          <div className="text-gray-500 text-[10px] mt-1">Next 6 hours</div>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* Placeholder for other views */}
          {currentView !== 'dashboard' && (
            <div className="lg:col-span-8 xl:col-span-9 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <h2 className="text-2xl font-bold mb-4 capitalize">{currentView} View</h2>
                <p>This section is under development. Check back soon!</p>
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
