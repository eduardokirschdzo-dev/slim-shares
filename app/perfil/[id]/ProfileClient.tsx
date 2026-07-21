'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import VoiceAssistant from '../../../components/VoiceAssistant';
import type { Profile, ProfileAnalytics, LinkExtra } from '../../../types/profile';

interface ProfileClientProps {
  initialProfile: Profile;
  analytics: ProfileAnalytics;
}

export default function ProfileClient({ initialProfile, analytics }: ProfileClientProps) {
  const [perfil, setPerfil] = useState<Profile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados de Edição tipados
  const [editNome, setEditNome] = useState(initialProfile.nome);
  const [editBio, setEditBio] = useState(initialProfile.bio || '');
  const [editWhatsapp, setEditWhatsapp] = useState(initialProfile.whatsapp || '');
  const [editInstagram, setEditInstagram] = useState(initialProfile.link_instagram || '');
  const [editMusicaFundo, setEditMusicaFundo] = useState(initialProfile.musica_fundo || '');
  const [editLinksExtras, setEditLinksExtras] = useState<LinkExtra[]>(initialProfile.links_extras || []);

  // Controle de Música
  useEffect(() => {
    if (perfil.musica_fundo) {
      if (!audioRef.current) {
        audioRef.current = new Audio(perfil.musica_fundo);
        audioRef.current.loop = true;
      } else if (audioRef.current.src !== perfil.musica_fundo) {
        audioRef.current.src = perfil.musica_fundo;
      }

      if (isPlayingMusic) {
        audioRef.current.play().catch((e) => console.log("Autoplay bloqueado.", e));
      } else {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isPlayingMusic, perfil.musica_fundo]);

  async function handleSaveChanges() {
    setIsLoading(true);
    const { error } = await supabase
      .from('nfc_profiles')
      .update({
        nome: editNome, 
        bio: editBio, 
        whatsapp: editWhatsapp,
        link_instagram: editInstagram, 
        musica_fundo: editMusicaFundo,
        links_extras: editLinksExtras
      })
      .eq('id', perfil.id);

    if (error) {
      alert('Erro: ' + error.message);
    } else {
      setPerfil({ 
        ...perfil, 
        nome: editNome, 
        bio: editBio, 
        whatsapp: editWhatsapp, 
        link_instagram: editInstagram, 
        musica_fundo: editMusicaFundo, 
        links_extras: editLinksExtras 
      });
      setIsEditing(false);
    }
    setIsLoading(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const filePath = `avatars/${perfil.id}-${Math.random()}`;

    setIsLoading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) { 
      alert('Erro ao enviar foto'); 
      setIsLoading(false); 
      return; 
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.from('nfc_profiles').update({ foto_url: publicUrl }).eq('id', perfil.id);
    
    setPerfil({ ...perfil, foto_url: publicUrl });
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center py-10 px-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-yellow-600/10 blur-[100px] pointer-events-none"></div>

      {perfil.musica_fundo && (
        <button onClick={() => setIsPlayingMusic(!isPlayingMusic)} className="absolute top-6 left-6 p-3 bg-[#111] border border-[#333] rounded-full shadow-lg z-20 hover:border-yellow-500 transition-colors">
          <span className={`text-xl inline-block ${isPlayingMusic ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>🎵</span>
        </button>
      )}

      <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 p-3 bg-[#111] border border-[#333] text-gray-400 hover:text-yellow-500 rounded-full shadow-lg z-20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      </button>

      <div className="w-full max-w-md z-10 flex flex-col items-center mt-8">
        {!isEditing ? (
          <>
            <div className="relative mb-6 group cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <div className="w-28 h-28 rounded-full border-2 border-yellow-600 p-1">
                  <div className="w-full h-full bg-[#111] rounded-full overflow-hidden flex items-center justify-center">
                    {perfil.foto_url ? <img src={perfil.foto_url} alt={perfil.nome} className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
                  </div>
                </div>
              </label>
              <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <div className="absolute bottom-0 right-0 bg-yellow-500 text-black w-7 h-7 rounded-full border-2 border-black flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">{perfil.nome}</h1>
            <p className="text-yellow-600 text-sm font-semibold mb-4 text-center px-4 tracking-wide">
              {perfil.bio || 'Criador • Slim Checkpoint'}
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              {[
                { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null, icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/> },
                { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null, icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
              ].map((btn, i) => btn.href && (
                <a key={i} href={btn.href} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 w-full p-6 bg-[#111111] hover:bg-[#1a1a1a] hover:border-yellow-600/50 border border-[#222] text-gray-200 font-medium rounded-3xl transition-all shadow-sm">
                  <svg className="w-8 h-8 fill-current text-white mb-1" viewBox="0 0 24 24">{btn.icon}</svg>
                  <span className="text-sm">{btn.label}</span>
                </a>
              ))}
              
              {perfil.links_extras?.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 w-full p-6 bg-[#111111] hover:bg-[#1a1a1a] hover:border-yellow-600/50 border border-[#222] text-gray-200 font-medium rounded-3xl transition-all shadow-sm">
                  <svg className="w-8 h-8 fill-current text-white mb-1" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-sm text-center line-clamp-1">{link.title}</span>
                </a>
              ))}
            </div>

            <div className="w-full mt-8 bg-[#0a0a0a] border border-yellow-600/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(202,138,4,0.05)] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-600/20 to-transparent pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span className="text-3xl font-bold text-white">{analytics.totalAcessos}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Acessos nesse checkpoint</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Último acesso</p>
                  <p className="text-sm font-medium text-gray-300 mt-1">{analytics.ultimoAcesso}</p>
                </div>
              </div>

              <div className="w-full h-12 relative z-10">
                <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                  <path d="M0,25 C10,25 15,10 25,18 C35,26 40,5 50,15 C60,25 65,12 75,20 C85,28 95,5 100,10" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]"/>
                </svg>
              </div>
            </div>

            <p className="text-[10px] text-gray-600 mt-8 font-medium uppercase tracking-widest">
              Slim Checkpoint © 2026
            </p>
          </>
        ) : (
          <div className="w-full bg-[#0a0a0a] p-6 rounded-3xl border border-[#222] text-left space-y-4 shadow-xl z-20 relative">
            <h2 className="text-xl font-bold text-white text-center mb-6">Editar Perfil</h2>
            
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
              <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full mt-1 bg-[#111] border border-[#333] rounded-xl p-3 text-white focus:border-yellow-500 outline-none transition-colors" />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio / Subtítulo</label>
              <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full mt-1 bg-[#111] border border-[#333] rounded-xl p-3 text-white focus:border-yellow-500 outline-none transition-colors" />
            </div>
            
            <button onClick={handleSaveChanges} disabled={isLoading} className="w-full mt-6 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(202,138,4,0.3)] disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </div>

      <VoiceAssistant profileNome={perfil.nome} profileBio={perfil.bio || ''} />
    </main>
  );
}