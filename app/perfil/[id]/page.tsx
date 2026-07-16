import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

// 1. Conecta o seu site ao Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Ops! As chaves do Supabase não foram encontradas no arquivo .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 2. Faz a busca no banco de dados (nfc_profiles)
  const { data, error } = await supabase
    .from('nfc_profiles')
    .select('*')
    .eq('id', id)
    .single();

  // 3. Tratamento de erro 404
  if (error || !data) {
    console.error("Erro ao buscar dados do Supabase:", error);
    return notFound();
  }

  // Definição simples para contornar o Type do TypeScript
  const perfil = data as any;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-sm bg-slate-900/60 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl text-center">
        
        {/* Foto de Perfil */}
        <div className="relative w-32 h-32 mx-auto mb-4 rounded-full p-[3px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 shadow-xl">
          <div className="w-full h-full bg-slate-950 rounded-full overflow-hidden flex items-center justify-center">
            {perfil.avatar_url ? (
              <img 
                src={perfil.avatar_url} 
                alt={perfil.nome} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
        </div>

        {/* Nome e Descrição */}
        <h1 className="text-2xl font-bold mb-1 tracking-tight">{perfil.nome || 'Sem Nome'}</h1>
        <p className="text-slate-400 text-sm mb-8">{perfil.descricao || 'Bem-vindo ao Slim Checkpoint!'}</p>

        {/* Botões Dinâmicos */}
        <div className="space-y-3.5">
          
          {perfil.whatsapp && (
            <a 
              href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              WhatsApp
            </a>
          )}

          {perfil.link_instagram && (
            <a 
              href={`https://instagram.com/${perfil.link_instagram.replace('@', '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Instagram
            </a>
          )}

          {perfil.link_tiktok && (
            <a 
              href={perfil.link_tiktok.startsWith('http') ? perfil.link_tiktok : `https://tiktok.com/@${perfil.link_tiktok.replace('@', '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-black border border-zinc-800 hover:border-zinc-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              TikTok
            </a>
          )}

          {perfil.site_proprio && (
            <a 
              href={perfil.site_proprio.startsWith('http') ? perfil.site_proprio : `https://${perfil.site_proprio}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Visite nosso Site
            </a>
          )}

          {perfil.link_maps && (
            <a 
              href={perfil.link_maps} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Como Chegar (GPS)
            </a>
          )}

          {perfil.link_cardapio && (
            <a 
              href={perfil.link_cardapio} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Cardápio Digital
            </a>
          )}

          {/* Box do PIX ajustado para a Vercel (sem usar navigator.clipboard no servidor) */}
          {perfil.chave_pix && (
            <div className="w-full p-3.5 bg-teal-950/40 border border-teal-800/40 rounded-xl shadow-inner text-center">
              <p className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest mb-1">Chave PIX</p>
              <p className="text-xs font-mono bg-teal-950/80 py-2 px-2.5 rounded-lg border border-teal-800/60 break-all select-all text-teal-200 font-medium">
                {perfil.chave_pix}
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}