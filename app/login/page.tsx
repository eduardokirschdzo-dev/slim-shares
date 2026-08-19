import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <form action={login} style={{ background: "#0a0a0a", padding: "32px", borderRadius: "16px", border: "1px solid #333", width: "300px" }}>
        <h1 style={{ color: "#eab308", marginBottom: "16px", fontSize: "1.2rem" }}>Entrar</h1>
        {error && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "12px" }}>E-mail ou senha inválidos.</p>}
        <input type="hidden" name="next" value={next ?? "/"} />
        <input name="email" type="email" placeholder="E-mail" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", marginBottom: "10px", boxSizing: "border-box" }} />
        <input name="password" type="password" placeholder="Senha" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #333", background: "#111", color: "#fff", marginBottom: "12px", boxSizing: "border-box" }} />
        <button type="submit" style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#eab308", color: "#000", fontWeight: "bold", border: "none", cursor: "pointer" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}