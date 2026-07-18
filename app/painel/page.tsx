'use client';

import { useEffect, useState } from 'react';
import { buscarTodosScans } from '../../services/checkpointService';

export default function Painel() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dados = await buscarTodosScans();
        setScans(dados);
      } catch (error: any) {
        console.error('Erro ao buscar os logs do painel:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#090909', overflowX: 'hidden' }}>
      
      <div style={{ position: 'relative', zIndex: 10, padding: 40, color: '#fff', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: 30, textAlign: 'center' }}>
          Dashboard Slim Checkpoint
        </h1>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Carregando dados...</p>
        ) : (
          <div>
            <div style={{ 
              background: 'rgba(26, 26, 26, 0.75)', 
              padding: 20, 
              borderRadius: 12, 
              marginBottom: 20,
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <h2>Total de Acessos: {scans.length}</h2>
            </div>
            
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {scans.map((scan: any) => (
                <li key={scan.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.04)', 
                  padding: 15, 
                  marginBottom: 10, 
                  borderRadius: 8,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Checkpoint: <strong>{scan.checkpoint || 'N/A'}</strong></span>
                  <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}