import { createClient } from '../../lib/supabase/server';
import { buscarRelatorioEventos } from '../../services/checkpointService';
import LogoutButton from './LogoutButton';

/**
 * Autorização: só chega aqui quem já passou pelo proxy.ts (login Supabase +
 * presença na tabela `admins`) — não há uma segunda checagem de senha aqui
 * de propósito. Antes existia um gate paralelo por senha única
 * (PAINEL_PASSWORD) usando lib/supabaseAdmin (service role, ignora RLS), com
 * um import quebrado (apontava pra lib/supabaseAdmin.ts, mas o arquivo real
 * é lib/supabase/supabaseAdmin.ts) — ou seja, esse gate nunca chegou a rodar
 * de verdade. Foi removido: agora há um único sistema de autorização,
 * baseado em identidade (Supabase Auth) e RLS, igual ao resto do projeto.
 */
export default async function Painel() {
  const supabase = await createClient();
  const eventos = await buscarRelatorioEventos(supabase);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2rem", color: "#eab308" }}>Dashboard Slim Pro</h1>
          <LogoutButton />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "#0a0a0a", padding: "20px", borderRadius: "16px", border: "1px solid #333" }}>
            <h3 style={{ color: "#888", fontSize: "0.9rem" }}>Total de Scans</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{eventos.length}</p>
          </div>
          <div style={{ background: "#0a0a0a", padding: "20px", borderRadius: "16px", border: "1px solid #333" }}>
            <h3 style={{ color: "#888", fontSize: "0.9rem" }}>Ativos Monitorados</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{new Set(eventos.map((e: any) => e.internal_code)).size}</p>
          </div>
        </div>
        <div style={{ background: "#0a0a0a", borderRadius: "16px", border: "1px solid #333", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111", textAlign: "left" }}>
                <th style={{ padding: "15px" }}>Ativo</th>
                <th style={{ padding: "15px" }}>Checkpoint</th>
                <th style={{ padding: "15px" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e: any) => (
                <tr key={e.event_id ?? `${e.internal_code}-${e.created_at}`} style={{ borderTop: "1px solid #222" }}>
                  <td style={{ padding: "15px", color: "#eab308", fontWeight: "bold" }}>{e.internal_code}</td>
                  <td style={{ padding: "15px" }}>{e.checkpoint_name}</td>
                  <td style={{ padding: "15px", fontSize: "0.85rem", opacity: 0.7 }}>{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
