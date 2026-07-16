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
      
      {/* Cartão com brilho de borda dourado */}
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
          
          {/* Botões Black & Gold */}
          {[
            { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null },
            { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null },
            { label: 'TikTok', href: perfil.link_tiktok ? (perfil.link_tiktok.startsWith('http') ? perfil.link_tiktok : `https://tiktok.com/@${perfil.link_tiktok.replace('@', '')}`) : null },
            { label: 'Visite nosso Site', href: perfil.site_proprio ? (perfil.site_proprio.startsWith('http') ? perfil.site_proprio : `https://${perfil.site_proprio}`) : null },
            { label: 'Como Chegar', href: perfil.link_maps },
            { label: 'Cardápio Digital', href: perfil.link_cardapio }
          ].map((btn, i) => btn.href && (
            <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" 
               className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 hover:border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] transition-all duration-300">
              {btn.label}
            </a>
          ))}

          {/* Box do PIX - Dourado Elegante */}
          {perfil.chave_pix && (
            <div className="w-full p-4 bg-[#0f0f0f] border border-yellow-600/30 rounded-xl shadow-inner text-center">
              <p className="text-[10px] text-yellow-600 font-extrabold uppercase tracking-[0.2em] mb-2">Chave PIX</p>
              <p className="text-xs font-mono bg-[#050505] py-2 px-2 rounded-lg border border-yellow-600/20 break-all select-all text-yellow-500 font-medium">
                {perfil.chave_pix}
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}