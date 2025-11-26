import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Incident {
    id: string;
    type: string;
    description: string;
    location: string;
    severity: string;
    timestamp: string;
    source: string;
    status: string;
}

const ReportsView = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchIncidents();
        const interval = setInterval(fetchIncidents, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/incidents');
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    const filteredIncidents = filter === 'all' 
        ? incidents 
        : incidents.filter(inc => inc.status.toLowerCase() === filter.toLowerCase());

    const exportToCSV = () => {
        const headers = ['ID', 'Type', 'Location', 'Time', 'Severity', 'Status', 'Source'];
        const rows = incidents.map(inc => [
            inc.id,
            inc.type,
            inc.location,
            new Date(inc.timestamp).toLocaleString(),
            inc.severity,
            inc.status,
            inc.source
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Incident Reports</h2>
                    <p className="text-sm text-slate-500">{incidents.length} total incidents</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded px-3 py-2"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button 
                        onClick={exportToCSV}
                        className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-sm font-bold py-2 px-4 rounded border border-cyan-200 transition-colors shadow-sm"
                    >
                        📥 Export CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Table View */}
                <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="overflow-y-auto h-full">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Severity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredIncidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            No incidents found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIncidents.map((incident) => (
                                        <tr 
                                            key={incident.id} 
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedIncident(incident)}
                                        >
                                            <td className="px-6 py-4 font-mono text-cyan-600 font-medium text-xs">
                                                {incident.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{incident.type}</td>
                                            <td className="px-6 py-4">{incident.location}</td>
                                            <td className="px-6 py-4 text-xs">
                                                {new Date(incident.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                    incident.severity === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' :
                                                    incident.severity === 'High' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                    incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                                    'bg-green-100 text-green-600 border-green-200'
                                                }`}>
                                                    {incident.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                    incident.status === 'Active' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                    incident.status === 'Dispatched' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                    'bg-green-100 text-green-600 border-green-200'
                                                }`}>
                                                    {incident.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-cyan-600 hover:text-cyan-700 font-medium">
                                                    View →
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel */}
                {selectedIncident && (
                    <div className="w-96 bg-white rounded-xl border border-slate-200 shadow-lg p-6 overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Incident Details</h3>
                            <button 
                                onClick={() => setSelectedIncident(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">ID</label>
                                <p className="text-sm font-mono text-slate-700">{selectedIncident.id}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Type</label>
                                <p className="text-lg font-bold text-slate-800">{selectedIncident.type}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Description</label>
                                <p className="text-sm text-slate-700">{selectedIncident.description}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Location</label>
                                <p className="text-sm text-slate-700">{selectedIncident.location}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Severity</label>
                                    <p className={`text-sm font-bold ${
                                        selectedIncident.severity === 'Critical' ? 'text-red-600' :
                                        selectedIncident.severity === 'High' ? 'text-orange-600' :
                                        'text-yellow-600'
                                    }`}>{selectedIncident.severity}</p>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold">Status</label>
                                    <p className="text-sm font-bold text-slate-700">{selectedIncident.status}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Source</label>
                                <p className="text-sm text-slate-700">{selectedIncident.source}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Timestamp</label>
                                <p className="text-sm text-slate-700">
                                    {new Date(selectedIncident.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsView;
