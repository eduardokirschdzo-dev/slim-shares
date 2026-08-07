import { cookies } from "next/headers";
import { createHash } from "crypto";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const COOKIE_NAME = "painel_session";

function hashSenha(senha: string) {
  return createHash("sha256").update(senha).digest("hex");
}

async function autenticar(formData: FormData) {
  "use server";
  const senha = formData.get("senha");
  const senhaCorreta = process.env.PAINEL_PASSWORD;

  if (typeof senha === "string" && senhaCorreta && senha === senhaCorreta) {
    (await cookies()).set(COOKIE_NAME, hashSenha(senhaCorreta), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/painel",
    });
  }
}

async function buscarRelatorioAdmin() {
  const { data, error } = await supabaseAdmin
    .from("view_eventos_com_perfil")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Painel] Erro ao buscar relatório:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function Painel() {
  const cookieStore = await cookies();
  const senhaCorreta = process.env.PAINEL_PASSWORD;
  const autenticado =
    !!senhaCorreta && cookieStore.get(COOKIE_NAME)?.value === hashSenha(senhaCorreta);

  if (!autenticado) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <form action={autenticar} style={{ background: "#0a0a0a", padding: "32px", borderRadius: "16px", border: "1px solid #333", width: "280px" }}>
          <h1 style={{ color: "#eab308", marginBottom: "16px", fontSize: "1.2rem" }}>Acesso ao Painel</h1>
          <input type="password" name="senha" placeholder="Senha" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", marginBottom: "12px", boxSizing: "border-box" }} />
          <button type="submit" style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#eab308", color: "#000", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const eventos = await buscarRelatorioAdmin();

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "40px", textAlign: "center", color: "#eab308" }}>Dashboard Slim Pro</h1>
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