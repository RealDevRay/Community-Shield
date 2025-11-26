import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const formatLog = (raw: any): string => {
  try {
    const timestamp = raw.created_at;
    let time_part = '--:--:--';
    
    if (timestamp) {
      if (timestamp.includes('T')) {
        time_part = timestamp.split('T')[1].substring(0, 8);
      } else {
        time_part = timestamp.substring(timestamp.length - 8);
      }
    }
    
    return `[${time_part}] ${raw.message}`;
  } catch (error) {
    return `[--:--:--] ${raw.message}`;
  }
};

export const useRealtimeLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        
        const formatted = (data || []).map(formatLog).reverse();
        setLogs(formatted);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('logs-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          const newLog = formatLog(payload.new);
          setLogs(prev => [...prev, newLog].slice(-50)); // Keep last 50
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { logs, loading };
};
