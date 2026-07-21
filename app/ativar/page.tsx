'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ativarPerfil } from '../../services/profileService';

function FormularioAtivacao() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // CORREÇÃO: Agora ele busca a 'tag' na URL (que é o que o sistema envia)
  const id = searchParams.get('tag') || searchParams.get('id'); 

  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleAtivar(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return alert('ID do cartão não encontrado na URL!');
    
    setLoading(true);

    try {
      // Usando a camada de serviços blindada
      await ativarPerfil(id, {
        nome: nome,
        whatsapp: whatsapp,
        link_instagram: instagram
      });

      setSucesso(true);
      // Aguarda 2 segundos e joga o cliente pro perfil novinho em folha
      setTimeout(() => {
        router.push(`/perfil/${id}`);
      }, 2000);
    } catch (error: any) {
      alert('Erro ao ativar: ' + error.message);
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

export default function AtivacaoPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600/10 flex items-center justify-center border border-yellow-600/30">
          <span className="text-2xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Ativação Slim
        </h1>
        
        <Suspense fallback={<div className="text-yellow-500">Carregando formulário...</div>}>
          <FormularioAtivacao />
        </Suspense>
        
      </div>
    </main>
  );
}