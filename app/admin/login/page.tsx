'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

function FormularioLoginAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/painel';
  const semPermissao = searchParams.get('erro') === 'sem_permissao';

  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
      {semPermissao && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          Esta conta não tem permissão de administrador.
        </p>
      )}
      {erro && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          {erro}
        </p>
      )}
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">E-mail</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="admin@email.com"
        />
      </div>
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">Senha</label>
        <input
          type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#050505] font-extrabold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all uppercase tracking-wide text-sm disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Entrar no Painel'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] text-center">
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Acesso Administrativo
        </h1>

        <Suspense fallback={<div className="text-yellow-500">Carregando...</div>}>
          <FormularioLoginAdmin />
        </Suspense>
      </div>
    </main>
  );
}
