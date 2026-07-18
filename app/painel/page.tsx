'use client';

import { useEffect, useState } from 'react';
import { buscarRelatorioEventos } from '../../services/checkpointService';

export default function Painel() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dados = await buscarRelatorioEventos();
        setEventos(dados);
      } catch (error: any) {
        console.error('Erro ao buscar relatórios:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '40px', textAlign: 'center', color: '#eab308' }}>
          Dashboard Slim Pro
        </h1>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Carregando dados em tempo real...</p>
        ) : (
          <div>
            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' 
            }}>
              <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '16px', border: '1px solid #333' }}>
                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>Total de Scans</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{eventos.length}</p>
              </div>
              <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '16px', border: '1px solid #333' }}>
                <h3 style={{ color: '#888', fontSize: '0.9rem' }}>Ativos Monitorados</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{new Set(eventos.map(e => e.internal_code)).size}</p>
              </div>
            </div>
            
            <div style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#111', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Ativo</th>
                    <th style={{ padding: '15px' }}>Checkpoint</th>
                    <th style={{ padding: '15px' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e: any) => (
                    <tr key={e.event_id} style={{ borderTop: '1px solid #222' }}>
                      <td style={{ padding: '15px', color: '#eab308', fontWeight: 'bold' }}>{e.internal_code}</td>
                      <td style={{ padding: '15px' }}>{e.checkpoint_name}</td>
                      <td style={{ padding: '15px', fontSize: '0.85rem', opacity: 0.7 }}>
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}