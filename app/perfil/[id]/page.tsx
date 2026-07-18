'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { buscarPerfil } from '@/services/profileService';
import { registrarScan } from '@/services/checkpointService';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Controle da Música de Fundo
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados do formulário de edição
  const [editNome, setEditNome] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editMusicaFundo, setEditMusicaFundo] = useState('');
  const [editLinksExtras, setEditLinksExtras] = useState<any[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      try {
        const data = await buscarPerfil(id);

        if (!data.nome) {
          router.push(`/ativar?id=${id}`);
          return;
        }

        setPerfil(data);
        setEditNome(data.nome);
        setEditBio(data.bio || '');
        setEditWhatsapp(data.whatsapp || '');
        setEditInstagram(data.link_instagram || '');
        setEditMusicaFundo(data.musica_fundo || '');
        setEditLinksExtras(data.links_extras || []);
        setLoading(false);

        const paramsUrl = new URLSearchParams(window.location.search);
        const checkpointStr = paramsUrl.get('cp') || 'Geral'; 
        await registrarScan(id, checkpointStr);

      } catch (error) {
        setLoading(false);
        return;
      }
    }
    loadData();
  }, [id, router]);

  // Tocar/Pausar música ambiente
  useEffect(() => {
    if (perfil?.musica_fundo) {
      if (!audioRef.current) {
        audioRef.current = new Audio(perfil.musica_fundo);
        audioRef.current.loop = true;
      } else if (audioRef.current.src !== perfil.musica_fundo) {
        audioRef.current.src = perfil.musica_fundo;
      }

      if (isPlayingMusic) {
        audioRef.current.play().catch((e) => console.log("Autoplay bloqueado pelo navegador.", e));
      } else {
        audioRef.current.pause();
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlayingMusic, perfil?.musica_fundo]);

  // Salvar alterações
  async function handleSaveChanges() {
    setLoading(true);
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
      .eq('id', id);

    if (error) {
      alert('Erro ao salvar alterações: ' + error.message);
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
    setLoading(false);
  }

  // Upload da foto
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setLoading(true);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao enviar foto: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('nfc_profiles')
      .update({ "foto.url": publicUrl })
      .eq('id', id);

    if (updateError) {
      alert('Erro ao salvar a referência da foto: ' + updateError.message);
    } else {
      setPerfil({ ...perfil, "foto.url": publicUrl });
    }
    setLoading(false);
  }

  function handleAddExtraLink() {
    if (!newLinkTitle || !newLinkUrl) return;
    const updated = [...editLinksExtras, { title: newLinkTitle, url: newLinkUrl }];
    setEditLinksExtras(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
  }

  function handleRemoveExtraLink(index: number) {
    const updated = editLinksExtras.filter((_, i) => i !== index);
    setEditLinksExtras(updated);
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500">Carregando...</div>;
  if (!perfil) return notFound();

  const fotoUrl = perfil["foto.url"] || perfil.foto_url;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500/30">
      
      {perfil.musica_fundo && (
        <button 
          onClick={() => setIsPlayingMusic(!isPlayingMusic)} 
          className="absolute top-6 left-6 p-3 bg-[#0a0a0a] border border-yellow-500/30 rounded-full shadow-lg transition-all z-20 flex items-center justify-center"
        >
          <span className={`text-2xl inline-block ${isPlayingMusic ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
            📻
          </span>
        </button>
      )}

      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="absolute top-6 right-6 p-3 bg-[#0a0a0a] border border-yellow-600/20 hover:border-yellow-500 text-yellow-500 rounded-full shadow-lg transition-all z-20"
      >
        ⚙️
      </button>

      <div className="w-full max-w-sm bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] backdrop-blur-xl text-center relative z-10">
        
        {!isEditing ? (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full p-[2px] bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 group cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer w-full h-full block">
                <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden flex items-center justify-center relative">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt={perfil.nome} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                  ) : (
                    <span className="text-4xl text-yellow-500 group-hover:opacity-60">👤</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-yellow-500 font-bold">Mudar Foto</span>
                  </div>
                </div>
              </label>
              <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            <h1 className="text-2xl font-bold mb-1 tracking-tight text-white">{perfil.nome}</h1>
            
            <p className="text-yellow-600/80 text-sm mb-8 font-medium uppercase tracking-widest min-h-[20px]">
              {perfil.bio || 'Slim Checkpoint'}
            </p>

            <div className="space-y-4">
              {[
                { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null },
                { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null },
              ].map((btn, i) => btn.href && (
                <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" 
                   className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 hover:border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] transition-all duration-300">
                  {btn.label}
                </a>
              ))}

              {perfil.links_extras && perfil.links_extras.map((link: any, index: number) => (
                <div key={index} className="space-y-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" 
                     className="block w-full py-3 bg-gradient-to-r from-yellow-600/15 to-[#0f0f0f] border border-yellow-500/20 hover:border-yellow-500 text-white rounded-xl shadow-md transition-all duration-300">
                    {link.title}
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-left space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 text-center">Configurações</h2>
            
            <div>
              <label className="text-xs text-gray-400">Nome</label>
              <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Descrição / Biografia</label>
              <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" placeholder="Sua descrição" />
            </div>

            <div>
              <label className="text-xs text-gray-400">WhatsApp (DDD + Número)</label>
              <input type="text" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Instagram (@seu_user)</label>
              <input type="text" value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Música Ambiente (Link direto .mp3)</label>
              <input 
                type="text" 
                placeholder="https://suamusica.com/ambiente.mp3" 
                value={editMusicaFundo} 
                onChange={(e) => setEditMusicaFundo(e.target.value)} 
                className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white text-xs" 
              />
            </div>

            <hr className="border-yellow-600/20 my-4" />

            <h3 className="text-sm font-bold text-yellow-500">Links Extras</h3>
            <div className="space-y-2">
              <input type="text" placeholder="Título (Ex: Portfólio)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-xs" />
              <input type="text" placeholder="URL do Link" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-xs" />
              <button type="button" onClick={handleAddExtraLink} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-1.5 rounded-lg text-xs transition-all">
                + Adicionar Novo Link
              </button>
            </div>

            <ul className="space-y-1 pt-2">
              {editLinksExtras.map((lk, idx) => (
                <li key={idx} className="flex justify-between items-center text-xs bg-[#151515] p-2 rounded border border-yellow-600/10">
                  <span className="truncate max-w-[200px]">{lk.title}</span>
                  <button onClick={() => handleRemoveExtraLink(idx)} className="text-red-500 hover:text-red-400">Remover</button>
                </li>
              ))}
            </ul>

            <button onClick={handleSaveChanges} className="w-full mt-6 py-3 bg-yellow-500 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-all">
              Salvar Alterações
            </button>
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-yellow-600/30 text-[9px] font-bold uppercase tracking-widest">Slim Checkpoint © 2026</p>
        </footer>
      </div>

      {/* Chamada limpa do componente de voz reutilizável */}
      <VoiceAssistant profileNome={perfil.nome} profileBio={perfil.bio} />

    </main>
  );
}