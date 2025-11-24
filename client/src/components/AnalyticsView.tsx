import React from 'react';

const AnalyticsView = () => {
    // Mock Data
    const crimeStats = [
        { type: 'Robbery', count: 12, trend: '+5%' },
        { type: 'Assault', count: 8, trend: '-2%' },
        { type: 'Traffic', count: 24, trend: '+15%' },
        { type: 'Disturbance', count: 18, trend: '0%' },
    ];

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {crimeStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{stat.type}</div>
                        <div className="flex justify-between items-end">
                            <div className="text-2xl font-bold text-slate-800">{stat.count}</div>
                            <div className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                {stat.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-cyan-600 text-sm font-bold uppercase tracking-wider mb-6">Incident Density Heatmap</h3>
                    <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50 relative overflow-hidden">
                        {/* CSS Heatmap Effect */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-orange-500/20 rounded-full blur-xl"></div>
                        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl"></div>
                        <span className="text-slate-400 text-xs z-10">Interactive Heatmap Visualization</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="text-cyan-600 text-sm font-bold uppercase tracking-wider mb-6">Response Time Analysis</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'CBD Sector', time: '1.2 min', width: '90%' },
                            { label: 'Westlands', time: '2.5 min', width: '75%' },
                            { label: 'Kibera', time: '4.1 min', width: '50%' },
                            { label: 'Karen', time: '5.8 min', width: '35%' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>{item.label}</span>
                                    <span>{item.time}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: item.width }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
