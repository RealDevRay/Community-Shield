import React from 'react';

interface StatsProps {
    incidentCount: number;
    unitCount: number;
}

const Stats: React.FC<StatsProps> = ({ incidentCount, unitCount }) => {
    // Mock data for chart - in real app, this would come from API
    const incidentTrend = [2, 5, 3, 8, 4, 6, incidentCount];
    const unitTrend = [3, 4, 5, 4, 6, 5, unitCount];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Incidents</h3>
                    <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                        {incidentCount}
                        <span className="text-xs font-normal text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            LIVE
                        </span>
                    </div>
                    <div className="mt-2 h-8 flex items-end gap-1">
                        {incidentTrend.map((val, i) => (
                            <div key={i} className="flex-1 bg-red-500/20 rounded-sm" style={{ height: `${(val / 10) * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Units</h3>
                    <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                        {unitCount}
                        <span className="text-xs font-normal text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                            PATROL
                        </span>
                    </div>
                    <div className="mt-2 h-8 flex items-end gap-1">
                        {unitTrend.map((val, i) => (
                            <div key={i} className="flex-1 bg-blue-500/20 rounded-sm" style={{ height: `${(val / 10) * 100}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Predictive Insights Panel */}
            <div className="glass-panel p-4 rounded-xl">
                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    AI Predictive Analytics
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Hotspot Risk Level:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-linear-to-r from-green-500 via-orange-500 to-red-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <span className="text-orange-400 font-bold text-sm">MEDIUM</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Recommended Route:</span>
                        <span className="text-cyan-400 font-bold text-sm bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">CBD → Westlands → Karen</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Bias Detection:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-green-400 font-bold text-sm">PASS</span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Prediction Accuracy:</span>
                        <span className="text-blue-400 font-bold text-sm">87%</span>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Next 24 Hours Forecast</div>
                    <div className="grid grid-cols-4 gap-1">
                        {[6, 12, 18, 24].map((hour) => (
                            <div key={hour} className="text-center">
                                <div className="text-[10px] text-gray-400">{hour}h</div>
                                <div className={`w-6 h-6 mx-auto rounded-full ${hour === 12 ? 'bg-red-500/30' : hour === 18 ? 'bg-orange-500/30' : 'bg-green-500/30'} flex items-center justify-center`}>
                                    <div className={`w-3 h-3 rounded-full ${hour === 12 ? 'bg-red-500' : hour === 18 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
