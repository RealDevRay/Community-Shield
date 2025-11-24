import React, { useEffect, useRef } from 'react';

interface LiveFeedProps {
    logs: string[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-white h-full flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-cyan-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    System Logs
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">LIVE_STREAM_V.1.0</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 scrollbar-thin">
                {logs.length === 0 ? (
                    <div className="text-slate-400 italic text-center mt-10 flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Waiting for system events...</span>
                    </div>
                ) : (
                    logs.slice(-20).map((log, index) => {
                        const isIncident = log.includes('INCIDENT') || log.includes('ALERT') || log.includes('New Incident');
                        const isDispatch = log.includes('DISPATCH') || log.includes('UNIT') || log.includes('Commander');
                        const isAnalysis = log.includes('ANALYST') || log.includes('AI') || log.includes('Analyzing');
                        
                        // Extract timestamp from log string (format: "[HH:MM:SS] message")
                        const timestampMatch = log.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
                        const timestamp = timestampMatch ? timestampMatch[1] : new Date().toLocaleTimeString([], { hour12: false });
                        
                        // Remove timestamp from log content for display
                        const logContent = log.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '');
                        
                        return (
                            <div key={`${timestamp}-${index}`} className={`flex gap-3 animate-fade-in p-2 rounded ${isIncident ? 'bg-red-50 border-l-2 border-red-500' : isDispatch ? 'bg-blue-50 border-l-2 border-blue-500' : isAnalysis ? 'bg-cyan-50 border-l-2 border-cyan-500' : 'bg-slate-50 border-l-2 border-slate-300'}`}>
                                <span className="text-slate-500 select-none font-bold">[{timestamp}]</span>
                                <span className="text-slate-700 break-words flex-1">
                                    <span className={`mr-2 font-bold ${isIncident ? 'text-red-600' : isDispatch ? 'text-blue-600' : isAnalysis ? 'text-cyan-600' : 'text-slate-500'}`}>
                                        {isIncident ? '🚨' : isDispatch ? '🚔' : isAnalysis ? '🤖' : '📊'}
                                    </span>
                                    {logContent}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default LiveFeed;
