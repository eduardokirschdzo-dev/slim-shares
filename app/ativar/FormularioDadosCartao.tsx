'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ativarPerfil } from '../../services/profileService';
import { createClient } from '../../lib/supabase/client';

/**
 * Usado quando app/ativar/page.tsx já encontrou uma sessão ativa (usuário
 * acabou de logar em /entrar, ou já tinha sessão de uma ativação anterior).
 * Só pede os dados do cartão — nada de e-mail/senha aqui, e nenhuma chamada a
 * supabase.auth.signUp(). É essa ausência de um segundo signUp() que corrige
 * o loop: antes, voltar de /entrar caía de novo no formulário de cadastro
 * completo, que tentava criar a conta de novo.
 */
export default function FormularioDadosCartao({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleAtivar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const ok = await ativarPerfil(supabase, id, userId, {
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

  return (
    <form onSubmit={handleAtivar} className="w-full space-y-4 text-left">
      <p className="text-center text-xs text-yellow-600/60 pb-2">
        Você já está logado — falta só vincular este cartão ao seu perfil.
      </p>

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

      <button
        type="submit" disabled={loading}
        className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#050505] font-extrabold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all uppercase tracking-wide text-sm disabled:opacity-50"
      >
        {loading ? 'Ativando...' : 'Finalizar Ativação'}
      </button>
    </form>
  );
}