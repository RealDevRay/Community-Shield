import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Unit {
  id: string;
  name: string;
  type: string;
  status: string;
  lat: number;
  lng: number;
}

const transformUnit = (raw: any): Unit => ({
  id: raw.id,
  name: raw.name,
  type: raw.type,
  status: raw.status,
  lat: parseFloat(raw.lat) || 0,
  lng: parseFloat(raw.lng) || 0
});

export const useRealtimeUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('units')
          .select('*');
        
        if (error) throw error;
        
        const transformed = (data || []).map(transformUnit);
        setUnits(transformed);
      } catch (error) {
        console.error('Error fetching units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('units-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'units' },
        (payload) => {
          const newUnit = transformUnit(payload.new);
          setUnits(prev => [...prev, newUnit]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'units' },
        (payload) => {
          const updated = transformUnit(payload.new);
          setUnits(prev => 
            prev.map(unit => unit.id === updated.id ? updated : unit)
          );
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'units' },
        (payload) => {
          setUnits(prev => prev.filter(unit => unit.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { units, loading };
};
