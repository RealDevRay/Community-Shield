import React, { useState } from 'react';

interface LiveFeedProps {
    logs: string[];
}

const LiveFeedTicker: React.FC<LiveFeedProps> = ({ logs }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Get the latest 5 logs for the ticker
    const tickerLogs = logs.slice(-5).reverse();
    
    return (
        <>
            {/* Scrolling Ticker Bar */}
            <div 
                onClick={() => setIsExpanded(true)}
                className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-2 px-4 cursor-pointer hover:from-slate-700 hover:to-slate-800 transition-all border-b border-slate-700 shadow-lg"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider">LIVE FEED</span>
                    </div>
                    
                    {/* Scrolling Text */}
                    <div className="flex-1 overflow-hidden">
                        <div className="animate-scroll-left whitespace-nowrap text-sm font-mono">
                            {tickerLogs.length > 0 ? (
                                tickerLogs.map((log, idx) => (
                                    <span key={idx} className="inline-block mr-12">
                                        {log.replace(/\[.*?\]\s*/, '')} {/* Remove timestamp */}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400">Waiting for system events...</span>
                            )}
                        </div>
                    </div>
                    
                    <button className="flex-shrink-0 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded border border-slate-600 transition-colors">
                        View All →
                    </button>
                </div>
            </div>

            {/* Expanded Modal */}
            {isExpanded && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    Live System Feed
                                </h2>
                                <p className="text-slate-300 text-sm mt-1">Real-time event monitoring</p>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="space-y-3">
                                {logs.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">
                                        <div className="text-6xl mb-4">📡</div>
                                        <p className="text-lg">Waiting for system events...</p>
                                    </div>
                                ) : (
                                    logs.slice().reverse().map((log, index) => {
                                        const isIncident = log.includes('INCIDENT') || log.includes('ALERT') || log.includes('New Incident') || log.includes('⚠️');
                                        const isDispatch = log.includes('DISPATCH') || log.includes('UNIT') || log.includes('Commander') || log.includes('👮');
                                        const isAnalysis = log.includes('ANALYST') || log.includes('AI') || log.includes('Analyzing') || log.includes('🧠');
                                        const isBias = log.includes('BIAS') || log.includes('⚖️');
                                        const isEmergency = log.includes('EMERGENCY') || log.includes('🚨');
                                        
                                        const timestampMatch = log.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
                                        const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleTimeString([], { hour12: false });
                                        const logContent = log.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '');
                                        
                                        return (
                                            <div 
                                                key={`${timestamp}-${index}`} 
                                                className={`flex gap-4 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                                                    isEmergency ? 'bg-red-50 border-red-500' :
                                                    isBias ? 'bg-orange-50 border-orange-500' :
                                                    isIncident ? 'bg-yellow-50 border-yellow-500' :
                                                    isDispatch ? 'bg-blue-50 border-blue-500' :
                                                    isAnalysis ? 'bg-cyan-50 border-cyan-500' :
                                                    'bg-white border-slate-300'
                                                }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                                                        isEmergency ? 'bg-red-100' :
                                                        isBias ? 'bg-orange-100' :
                                                        isIncident ? 'bg-yellow-100' :
                                                        isDispatch ? 'bg-blue-100' :
                                                        isAnalysis ? 'bg-cyan-100' :
                                                        'bg-slate-100'
                                                    }`}>
                                                        {isEmergency ? '🚨' : isBias ? '⚖️' : isIncident ? '⚠️' : isDispatch ? '🚔' : isAnalysis ? '🤖' : '📊'}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                            isEmergency ? 'bg-red-200 text-red-800' :
                                                            isBias ? 'bg-orange-200 text-orange-800' :
                                                            isIncident ? 'bg-yellow-200 text-yellow-800' :
                                                            isDispatch ? 'bg-blue-200 text-blue-800' :
                                                            isAnalysis ? 'bg-cyan-200 text-cyan-800' :
                                                            'bg-slate-200 text-slate-800'
                                                        }`}>
                                                            {isEmergency ? 'EMERGENCY' : isBias ? 'BIAS ALERT' : isIncident ? 'INCIDENT' : isDispatch ? 'DISPATCH' : isAnalysis ? 'ANALYSIS' : 'SYSTEM'}
                                                        </span>
                                                        <span className="text-slate-400 text-xs font-mono">{timestamp}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm font-mono">{logContent}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center">
                            <div className="text-sm text-slate-500">
                                Total Events: <span className="font-bold text-slate-700">{logs.length}</span>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll-left {
                    animation: scroll-left 30s linear infinite;
                }
                .animate-scroll-left:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </>
    );
};

export default LiveFeedTicker;
