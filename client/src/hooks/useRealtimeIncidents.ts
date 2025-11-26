import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity: string;
  timestamp: string;
  source: string;
  status: string;
}

const transformIncident = (raw: any): Incident => ({
  id: raw.id,
  type: raw.type,
  description: raw.summary,
  location: raw.location,
  lat: parseFloat(raw.lat) || 0,
  lng: parseFloat(raw.lng) || 0,
  severity: raw.severity,
  timestamp: raw.created_at,
  source: raw.source,
  status: raw.status
});

export const useRealtimeIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        
        const transformed = (data || []).map(transformIncident);
        setIncidents(transformed);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('incidents-realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          const newIncident = transformIncident(payload.new);
          setIncidents(prev => [newIncident, ...prev].slice(0, 50));
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        (payload) => {
          const updated = transformIncident(payload.new);
          setIncidents(prev => 
            prev.map(inc => inc.id === updated.id ? updated : inc)
          );
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'incidents' },
        (payload) => {
          setIncidents(prev => prev.filter(inc => inc.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { incidents, loading };
};
