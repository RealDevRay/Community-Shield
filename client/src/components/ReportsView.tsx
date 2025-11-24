import React from 'react';

const ReportsView = () => {
    // Mock Data
    const reports = [
        { id: 'RPT-2025-001', type: 'Robbery', location: 'Moi Avenue', time: '10:42 AM', status: 'Resolved' },
        { id: 'RPT-2025-002', type: 'Traffic', location: 'Uhuru Highway', time: '11:15 AM', status: 'Active' },
        { id: 'RPT-2025-003', type: 'Medical', location: 'Westlands', time: '11:30 AM', status: 'Dispatched' },
        { id: 'RPT-2025-004', type: 'Fire', location: 'Gikomba', time: '12:05 PM', status: 'Critical' },
        { id: 'RPT-2025-005', type: 'Theft', location: 'CBD', time: '12:45 PM', status: 'Resolved' },
    ];

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Daily Incident Reports</h2>
                <button className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-sm font-bold py-2 px-4 rounded border border-cyan-200 transition-colors shadow-sm">
                    Export CSV
                </button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Report ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-cyan-600 font-medium">{report.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{report.type}</td>
                                    <td className="px-6 py-4">{report.location}</td>
                                    <td className="px-6 py-4">{report.time}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            report.status === 'Critical' ? 'bg-red-100 text-red-600 border-red-200' :
                                            report.status === 'Active' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                            report.status === 'Resolved' ? 'bg-green-100 text-green-600 border-green-200' :
                                            'bg-blue-100 text-blue-600 border-blue-200'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-cyan-600 underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
