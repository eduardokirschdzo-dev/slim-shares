import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Ops! As chaves do Supabase não foram encontradas.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from('nfc_profiles').select('*').eq('id', id).single();

  if (error || !data) return notFound();
  const perfil = data as any;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500/30">
      
      <div className="w-full max-w-sm bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] backdrop-blur-xl text-center">
        
        {/* Foto com moldura dourada */}
        <div className="relative w-32 h-32 mx-auto mb-4 rounded-full p-[2px] bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20">
          <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden flex items-center justify-center">
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt={perfil.nome} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-yellow-500">👤</span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">{perfil.nome || 'Sem Nome'}</h1>
        <p className="text-yellow-600/80 text-sm mb-8 font-medium uppercase tracking-widest">{perfil.descricao || 'Slim Checkpoint'}</p>

        <div className="space-y-4">
          
          {/* Botão WhatsApp Cor Original */}
          {perfil.whatsapp && (
            <a href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
               className="block w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all duration-300">
              WhatsApp
            </a>
          )}

          {/* Outros Botões Black & Gold */}
          {perfil.link_instagram && (
            <a href={`https://instagram.com/${perfil.link_instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
               className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 hover:border-yellow-500 text-yellow-500 font-bold rounded-xl transition-all">Instagram</a>
          )}

          {/* Botões de Ação Administrativa */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-yellow-600/10">
            <button className="text-[10px] uppercase tracking-widest text-yellow-600/50 hover:text-yellow-500 transition-colors">Personalizar</button>
            <button className="text-[10px] uppercase tracking-widest text-yellow-600/50 hover:text-yellow-500 transition-colors">Configurar</button>
          </div>

          {/* Box do PIX */}
          {perfil.chave_pix && (
            <div className="w-full p-4 mt-4 bg-[#0f0f0f] border border-yellow-600/30 rounded-xl text-center">
              <p className="text-[10px] text-yellow-600 font-extrabold uppercase tracking-[0.2em] mb-2">Chave PIX</p>
              <p className="text-xs font-mono text-yellow-500/80 break-all select-all">{perfil.chave_pix}</p>
            </div>
          )}
        </div>

        {/* Rodapé com animação de pulsação suave */}
        <footer className="mt-12 text-center animate-pulse">
          <p className="text-yellow-600/30 text-[9px] font-bold uppercase tracking-widest">
            Slim Checkpoint © 2026
          </p>
          <div className="w-12 h-[1px] bg-yellow-600/20 mx-auto mt-2"></div>
        </footer>
      </div>
    </main>
  );
}