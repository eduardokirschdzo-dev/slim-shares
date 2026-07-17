'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Painel() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Agora usando a constante 'supabase' importada
      const { data, error } = await supabase
        .from('nfc_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setScans(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: 40, background: '#090909', color: '#fff', minHeight: '100vh' }}>
      <h1>Dashboard Slim Checkpoint</h1>
      
      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <div>
          <div style={{ background: '#1a1a1a', padding: 20, borderRadius: 10, marginBottom: 20 }}>
            <h2>Total de Acessos: {scans.length}</h2>
          </div>
          
          <ul>
            {scans.map((scan: any) => (
              <li key={scan.id} style={{ marginBottom: 10 }}>
                Checkpoint: <strong>{scan.checkpoint}</strong> - {new Date(scan.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}