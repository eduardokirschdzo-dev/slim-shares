'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use, useRef } from 'react';

import { supabase } from '../../../lib/supabase';
import { buscarPerfil } from '../../../services/profileService';
import { registrarScan } from '../../../services/checkpointService';
import VoiceAssistant from '../../../components/VoiceAssistant';

export default function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

        // --- NOVA LÓGICA DE REGISTRO (ARQUITETURA SAAS) ---
        const paramsUrl = new URLSearchParams(window.location.search);
        // Busca o código do ativo (tag) na URL, se não houver, usa o ID como fallback
        const assetCode = paramsUrl.get('tag') || id; 
        const checkpointStr = paramsUrl.get('cp') || 'Geral'; 
        
        await registrarScan(assetCode, checkpointStr);
        // ---------------------------------------------------

      } catch (error) {
        setLoading(false);
        return;
      }
    }
    loadData();
  }, [id, router]);

  useEffect(() => {
    if (perfil?.musica_fundo) {
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
  }, [isPlayingMusic, perfil?.musica_fundo]);

  async function handleSaveChanges() {
    setLoading(true);
    const { error } = await supabase
      .from('nfc_profiles')
      .update({
        nome: editNome, bio: editBio, whatsapp: editWhatsapp,
        link_instagram: editInstagram, musica_fundo: editMusicaFundo,
        links_extras: editLinksExtras
      })
      .eq('id', id);

    if (error) alert('Erro: ' + error.message);
    else {
      setPerfil({ ...perfil, nome: editNome, bio: editBio, whatsapp: editWhatsapp, link_instagram: editInstagram, musica_fundo: editMusicaFundo, links_extras: editLinksExtras });
      setIsEditing(false);
    }
    setLoading(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const filePath = `avatars/${id}-${Math.random()}`;

    setLoading(true);
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) { alert('Erro ao enviar foto'); setLoading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.from('nfc_profiles').update({ "foto.url": publicUrl }).eq('id', id);
    setPerfil({ ...perfil, "foto.url": publicUrl });
    setLoading(false);
  }

  function handleAddExtraLink() {
    if (!newLinkTitle || !newLinkUrl) return;
    setEditLinksExtras([...editLinksExtras, { title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle(''); setNewLinkUrl('');
  }

  function handleRemoveExtraLink(index: number) {
    setEditLinksExtras(editLinksExtras.filter((_, i) => i !== index));
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500">Carregando...</div>;
  if (!perfil) return notFound();

  const fotoUrl = perfil["foto.url"] || perfil.foto_url;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500/30">
      {perfil.musica_fundo && (
        <button onClick={() => setIsPlayingMusic(!isPlayingMusic)} className="absolute top-6 left-6 p-3 bg-[#0a0a0a] border border-yellow-500/30 rounded-full shadow-lg z-20">
          <span className={`text-2xl inline-block ${isPlayingMusic ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>📻</span>
        </button>
      )}

      <button onClick={() => setIsEditing(!isEditing)} className="absolute top-6 right-6 p-3 bg-[#0a0a0a] border border-yellow-600/20 text-yellow-500 rounded-full shadow-lg z-20">⚙️</button>

      <div className="w-full max-w-sm bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 backdrop-blur-xl text-center">
        {!isEditing ? (
          <>
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full p-[2px] bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600">
              <label htmlFor="photo-upload" className="cursor-pointer w-full h-full block">
                <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden flex items-center justify-center">
                  {fotoUrl ? <img src={fotoUrl} alt={perfil.nome} className="w-full h-full object-cover" /> : <span className="text-4xl text-yellow-500">👤</span>}
                </div>
              </label>
              <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <h1 className="text-2xl font-bold mb-1 text-white">{perfil.nome}</h1>
            <p className="text-yellow-600/80 text-sm mb-8 font-medium uppercase tracking-widest">{perfil.bio || 'Slim Checkpoint'}</p>
            <div className="space-y-4">
              {[
                { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null },
                { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null },
              ].map((btn, i) => btn.href && <a key={i} href={btn.href} target="_blank" className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 text-yellow-500 font-bold rounded-xl">{btn.label}</a>)}
              {perfil.links_extras?.map((link: any, index: number) => (
                <a key={index} href={link.url} target="_blank" className="block w-full py-3 bg-gradient-to-r from-yellow-600/15 to-[#0f0f0f] border border-yellow-500/20 text-white rounded-xl">{link.title}</a>
              ))}
            </div>
          </>
        ) : (
          <div className="text-left space-y-4">
            <h2 className="text-xl font-bold text-yellow-500 text-center">Configurações</h2>
            <div><label className="text-xs text-gray-400">Nome</label><input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" /></div>
            <div><label className="text-xs text-gray-400">Bio</label><input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" /></div>
            <button onClick={handleSaveChanges} className="w-full mt-6 py-3 bg-yellow-500 text-black font-bold rounded-xl">Salvar Alterações</button>
          </div>
        )}
      </div>
      <VoiceAssistant profileNome={perfil.nome} profileBio={perfil.bio} />
    </main>
  );
}