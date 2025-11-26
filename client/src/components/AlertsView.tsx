import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Alert {
    id: string;
    type: string;
    severity: string;
    message: string;
    time: string;
}

const AlertsView = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [biasAlerts, setBiasAlerts] = useState<number>(0);
    const [systemAlerts, setSystemAlerts] = useState<number>(0);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const logsRes = await axios.get('http://localhost:8000/api/logs');
            const logs = logsRes.data;
            
            // Parse logs into alerts
            const parsedAlerts: Alert[] = [];
            let biasCount = 0;
            let systemCount = 0;

            logs.forEach((log: string, index: number) => {
                const timeMatch = log.match(/\[(\d{2}:\d{2}:\d{2})\]/);
                const time = timeMatch ? timeMatch[1] : '00:00:00';
                const message = log.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, '');

                if (message.includes('BIAS') || message.includes('⚖️')) {
                    parsedAlerts.push({
                        id: `alert-${index}`,
                        type: 'Bias Warning',
                        severity: 'High',
                        message: message.replace('⚖️', '').trim(),
                        time
                    });
                    biasCount++;
                } else if (message.includes('EMERGENCY') || message.includes('🚨')) {
                    parsedAlerts.push({
                        id: `alert-${index}`,
                        type: 'Emergency',
                        severity: 'Critical',
                        message: message.replace('🚨', '').trim(),
                        time
                    });
                } else if (message.includes('Commander') || message.includes('Dispatched')) {
                    parsedAlerts.push({
                        id: `alert-${index}`,
                        type: 'Dispatch',
                        severity: 'Medium',
                        message: message.replace('👮', '').trim(),
                        time
                    });
                    systemCount++;
                }
            });

            setAlerts(parsedAlerts.slice(0, 20));
            setBiasAlerts(biasCount);
            setSystemAlerts(systemCount);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const dismissAlert = (id: string) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                    <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Critical Alerts</div>
                    <div className="text-2xl font-bold text-red-800">
                        {alerts.filter(a => a.severity === 'Critical').length}
                    </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
                    <div className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Bias Warnings</div>
                    <div className="text-2xl font-bold text-orange-800">{biasAlerts}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                    <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">System Notices</div>
                    <div className="text-2xl font-bold text-blue-800">{systemAlerts}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-1 p-6 overflow-y-auto">
                <h3 className="text-slate-800 text-lg font-bold mb-4">Alert Feed</h3>
                <div className="space-y-4">
                    {alerts.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <div className="text-4xl mb-2">✓</div>
                            <p>No active alerts</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                <div className={`w-2 h-2 mt-2 rounded-full ${
                                    alert.severity === 'Critical' ? 'bg-red-500 shadow-sm animate-pulse' :
                                    alert.severity === 'High' ? 'bg-orange-500 shadow-sm' :
                                    'bg-blue-500 shadow-sm'
                                }`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                            alert.severity === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' :
                                            alert.severity === 'High' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                            'bg-blue-100 text-blue-600 border-blue-200'
                                        }`}>{alert.type}</span>
                                        <span className="text-slate-400 text-xs">{alert.time}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm">{alert.message}</p>
                                </div>
                                <button 
                                    onClick={() => dismissAlert(alert.id)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsView;
