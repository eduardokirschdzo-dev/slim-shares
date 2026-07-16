'use client';

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolvemos a promise dos params corretamente para o Next.js 15+
  const { id } = use(params);
  
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('nfc_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        setLoading(false);
        return;
      }
      setPerfil(data);
      setLoading(false);

      // Registra o acesso
      await supabase.from('nfc_scans').insert([{ profile_id: id }]);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500">Carregando...</div>;
  if (!perfil) return notFound();

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500/30">
      <div className="w-full max-w-sm bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] backdrop-blur-xl text-center">
        
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
          {[
            { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null },
            { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null },
            { label: 'Visite nosso Site', href: perfil.site_proprio ? (perfil.site_proprio.startsWith('http') ? perfil.site_proprio : `https://${perfil.site_proprio}`) : null },
            { label: 'Como Chegar', href: perfil.link_maps },
            { label: 'Cardápio Digital', href: perfil.link_cardapio }
          ].map((btn, i) => btn.href && (
            <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" 
               className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 hover:border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] transition-all duration-300">
              {btn.label}
            </a>
          ))}
        </div>

        <footer className="mt-12 text-center animate-pulse">
          <p className="text-yellow-600/30 text-[9px] font-bold uppercase tracking-widest">Slim Checkpoint © 2026</p>
        </footer>
      </div>
    </main>
  );
}