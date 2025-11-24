import React from 'react';

const AlertsView = () => {
    // Mock Data
    const alerts = [
        { id: 1, type: 'BIAS_WARNING', message: 'Potential bias detected in incident #402. Subjective language used.', time: '2 mins ago', severity: 'Medium' },
        { id: 2, type: 'SYSTEM_ERROR', message: 'Connection lost to Unit Alpha-1 GPS tracker.', time: '15 mins ago', severity: 'High' },
        { id: 3, type: 'HOTSPOT_ALERT', message: 'Sudden spike in reports from Kibera Sector 4.', time: '1 hour ago', severity: 'Medium' },
        { id: 4, type: 'MAINTENANCE', message: 'Scheduled server maintenance in 4 hours.', time: '2 hours ago', severity: 'Low' },
    ];

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                    <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Critical Alerts</div>
                    <div className="text-2xl font-bold text-red-800">1</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
                    <div className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Warnings</div>
                    <div className="text-2xl font-bold text-orange-800">2</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                    <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">System Notices</div>
                    <div className="text-2xl font-bold text-blue-800">1</div>
                </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-1 p-6">
                <h3 className="text-slate-800 text-lg font-bold mb-4">Alert Feed</h3>
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                                alert.severity === 'High' ? 'bg-red-500 shadow-sm' :
                                alert.severity === 'Medium' ? 'bg-orange-500 shadow-sm' :
                                'bg-blue-500 shadow-sm'
                            }`}></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                        alert.severity === 'High' ? 'bg-red-100 text-red-600 border-red-200' :
                                        alert.severity === 'Medium' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                        'bg-blue-100 text-blue-600 border-blue-200'
                                    }`}>{alert.type}</span>
                                    <span className="text-slate-400 text-xs">{alert.time}</span>
                                </div>
                                <p className="text-slate-600 text-sm">{alert.message}</p>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertsView;
