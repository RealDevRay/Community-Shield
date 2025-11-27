import { useState, useEffect } from 'react';
import axios from 'axios';

interface Incident {
    id: string;
    type: string;
    severity: string;
    location: string;
    created_at: string;
}

interface BiasCheck {
    id: string;
    incident_id: string;
    method: string;
    bias_score: number;
    status: string;
    warnings: string[];
    reasoning: string;
    created_at: string;
    incidents: Incident;
}

interface Alert {
    id: string;
    type: string;
    severity: string;
    message: string;
    time: string;
    category: 'critical' | 'bias' | 'system';
}

const AlertsView = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [criticalCount, setCriticalCount] = useState<number>(0);
    const [biasCount, setBiasCount] = useState<number>(0);
    const [systemCount, setSystemCount] = useState<number>(0);

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const [incidentsRes, biasRes, logsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/incidents'),
                axios.get('http://localhost:8000/api/bias-checks'),
                axios.get('http://localhost:8000/api/logs')
            ]);

            const allAlerts: Alert[] = [];
            let critical = 0;
            let bias = 0;
            let system = 0;

            // 1. Critical Incidents (AI-determined severity)
            incidentsRes.data.forEach((incident: any) => {
                if (incident.severity === 'Critical' || incident.severity === 'High') {
                    allAlerts.push({
                        id: `incident-${incident.id}`,
                        type: 'Critical Incident',
                        severity: incident.severity,
                        message: `${incident.type} at ${incident.location}`,
                        time: new Date(incident.timestamp).toLocaleTimeString(),
                        category: 'critical'
                    });
                    critical++;
                }
            });

            // 2. Bias Warnings (AI BiasGuard detections)
            biasRes.data.forEach((check: BiasCheck) => {
                if (check.status === 'Flagged' || check.warnings?.length > 0) {
                    const warningText = check.warnings?.join(', ') || check.reasoning;
                    allAlerts.push({
                        id: `bias-${check.id}`,
                        type: 'Bias Warning',
                        severity: 'High',
                        message: `${check.incidents?.type || 'Incident'} flagged: ${warningText}`,
                        time: new Date(check.created_at).toLocaleTimeString(),
                        category: 'bias'
                    });
                    bias++;
                }
            });

            // 3. System Alerts (from logs)
            logsRes.data.forEach((log: string) => {
                if (log.includes('EMERGENCY') || log.includes('🚨')) {
                    const timeMatch = log.match(/\[(\d{2}:\d{2}:\d{2})\]/);
                    const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString();
                    const message = log.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, '').replace('🚨', '').trim();
                    
                    allAlerts.push({
                        id: `system-${Date.now()}-${Math.random()}`,
                        type: 'Emergency Alert',
                        severity: 'Critical',
                        message,
                        time,
                        category: 'system'
                    });
                    system++;
                }
            });

            // Sort by time (most recent first)
            allAlerts.sort((a, b) => {
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
                return (timeB[0] * 3600 + timeB[1] * 60 + timeB[2]) - 
                       (timeA[0] * 3600 + timeA[1] * 60 + timeA[2]);
            });

            setAlerts(allAlerts.slice(0, 50)); // Limit to 50 most recent
            setCriticalCount(critical);
            setBiasCount(bias);
            setSystemCount(system);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const dismissAlert = (id: string) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                    <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">
                        Critical Incidents
                    </div>
                    <div className="text-2xl font-bold text-red-800">{criticalCount}</div>
                    <div className="text-xs text-red-600 mt-1">AI-detected high severity</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
                    <div className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">
                        Bias Warnings
                    </div>
                    <div className="text-2xl font-bold text-orange-800">{biasCount}</div>
                    <div className="text-xs text-orange-600 mt-1">BiasGuard AI alerts</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                    <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                        System Alerts
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{systemCount}</div>
                    <div className="text-xs text-blue-600 mt-1">Emergency protocols</div>
                </div>
            </div>

            {/* Alert Feed */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-1 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-slate-800 text-lg font-bold">Alert Feed</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        AI-categorized incidents, bias warnings, and system alerts
                    </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {alerts.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <div className="text-4xl mb-2">✓</div>
                                <p>No active alerts</p>
                                <p className="text-xs mt-2">All systems nominal</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div 
                                    key={alert.id} 
                                    className={`flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                                        alert.category === 'critical' ? 'bg-red-50 border-red-500' :
                                        alert.category === 'bias' ? 'bg-orange-50 border-orange-500' :
                                        'bg-blue-50 border-blue-500'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                            alert.category === 'critical' ? 'bg-red-100' :
                                            alert.category === 'bias' ? 'bg-orange-100' :
                                            'bg-blue-100'
                                        }`}>
                                            {alert.category === 'critical' ? '⚠️' : 
                                             alert.category === 'bias' ? '⚖️' : '🚨'}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                                alert.category === 'critical' ? 'bg-red-200 text-red-800 border-red-300' :
                                                alert.category === 'bias' ? 'bg-orange-200 text-orange-800 border-orange-300' :
                                                'bg-blue-200 text-blue-800 border-blue-300'
                                            }`}>
                                                {alert.type}
                                            </span>
                                            <span className="text-slate-400 text-xs">{alert.time}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm">{alert.message}</p>
                                        {alert.severity && (
                                            <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded ${
                                                alert.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {alert.severity}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => dismissAlert(alert.id)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                        title="Dismiss alert"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsView;
