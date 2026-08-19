'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ativarPerfil } from '../../services/profileService';
import { createClient } from '../../lib/supabase/client';

/**
 * Usado quando app/ativar/page.tsx NÃO encontrou sessão ativa. Cria a conta
 * (signUp) e, se o Supabase liberar sessão na hora (sem exigir confirmação de
 * e-mail), já ativa o cartão em seguida. Se exigir confirmação, mostra a tela
 * de "confirme seu e-mail" — ao voltar via /entrar já logado, quem responde é
 * o AtivacaoPage (server), que passa a renderizar FormularioDadosCartao em
 * vez deste componente, então não há um segundo signUp().
 */
export default function FormularioNovaConta({ id }: { id: string }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false);

  async function handleAtivar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return alert('A senha precisa ter pelo menos 6 caracteres.');

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (authError) throw authError;

      // Se o projeto exigir confirmação de e-mail, não haverá sessão ainda.
      if (!authData.session || !authData.user) {
        setPrecisaConfirmarEmail(true);
        setLoading(false);
        return;
      }

      const ok = await ativarPerfil(supabase, id, authData.user.id, {
        nome,
        whatsapp,
        link_instagram: instagram,
      });

      if (!ok) throw new Error('Não foi possível salvar os dados do perfil.');

      setSucesso(true);
      setTimeout(() => {
        router.push(`/perfil/${id}`);
      }, 2000);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error);
      alert('Erro ao ativar: ' + mensagem);
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="text-center animate-pulse">
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">Cartão Ativado!</h2>
        <p className="text-yellow-600/70">Redirecionando para o seu perfil...</p>
      </div>
    );
  }

  if (precisaConfirmarEmail) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">Confirme seu e-mail</h2>
        <p className="text-yellow-600/70 text-sm">
          Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar,
          volte aqui e faça login em{' '}
          <a
            href={`/entrar?redirect=${encodeURIComponent(`/ativar?tag=${id}`)}`}
            className="underline text-yellow-500"
          >
            /entrar
          </a>{' '}
          — ao voltar, você só vai precisar preencher os dados do cartão, sem repetir o cadastro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleAtivar} className="w-full space-y-4 text-left">
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">Nome do Estúdio / Artista</label>
        <input
          type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Ex: Studio Druwnba"
        />
      </div>
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">WhatsApp</label>
        <input
          type="text" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Ex: 51999999999"
        />
      </div>
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">Link do Instagram</label>
        <input
          type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Ex: https://instagram.com/seuperfil"
        />
      </div>

      <div className="pt-2 border-t border-yellow-600/10">
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1 mt-3">
          Seu e-mail (para acessar e editar o perfil depois)
        </label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="voce@email.com"
        />
      </div>
      <div>
        <label className="block text-yellow-600/80 text-xs font-bold uppercase tracking-wider mb-1">Crie uma senha</label>
        <input
          type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-yellow-600/30 text-white rounded-xl p-3 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#050505] font-extrabold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all uppercase tracking-wide text-sm disabled:opacity-50"
      >
        {loading ? 'Ativando...' : 'Finalizar Ativação'}
      </button>

      <p className="text-center text-xs text-gray-500 pt-2">
        Já tem uma conta?{' '}
        <a
          href={`/entrar?redirect=${encodeURIComponent(`/ativar?tag=${id}`)}`}
          className="text-yellow-600 underline"
        >
          Entrar
        </a>
      </p>
    </form>
  );
}