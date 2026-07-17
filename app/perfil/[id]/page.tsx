'use client';

import { createClient } from '@supabase/supabase-js';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Estados do formulário de edição
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editSite, setEditSite] = useState('');
  const [editLinksExtras, setEditLinksExtras] = useState<any[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

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

      if (!data.nome) {
        router.push(`/ativar?id=${id}`);
        return;
      }

      setPerfil(data);
      setEditNome(data.nome);
      setEditDescricao(data.descricao || '');
      setEditWhatsapp(data.whatsapp || '');
      setEditInstagram(data.link_instagram || '');
      setEditSite(data.site_proprio || '');
      setEditLinksExtras(data.links_extras || []);
      setLoading(false);

      // Registra checkpoint
      const paramsUrl = new URLSearchParams(window.location.search);
      const checkpointStr = paramsUrl.get('cp') || 'Geral'; 

      await supabase.from('nfc_scans').insert([{ 
        profile_id: id,
        checkpoint: checkpointStr
      }]);
    }
    loadData();
  }, [id, router]);

  // Função para fazer upload da foto de perfil
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setLoading(true);

    // Faz upload para o bucket 'avatars' no seu Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erro ao enviar foto: ' + uploadError.message);
      setLoading(false);
      return;
    }

    // Pega a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Atualiza no banco
    const { error: updateError } = await supabase
      .from('nfc_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', id);

    if (!updateError) {
      setPerfil({ ...perfil, avatar_url: publicUrl });
    }
    setLoading(false);
  }

  // Função para salvar as alterações do perfil
  async function handleSaveChanges() {
    setLoading(true);
    const { error } = await supabase
      .from('nfc_profiles')
      .update({
        nome: editNome,
        descricao: editDescricao,
        whatsapp: editWhatsapp,
        link_instagram: editInstagram,
        site_proprio: editSite,
        links_extras: editLinksExtras
      })
      .eq('id', id);

    if (error) {
      alert('Erro ao salvar alterações: ' + error.message);
    } else {
      setPerfil({
        ...perfil,
        nome: editNome,
        descricao: editDescricao,
        whatsapp: editWhatsapp,
        link_instagram: editInstagram,
        site_proprio: editSite,
        links_extras: editLinksExtras
      });
      setIsEditing(false);
    }
    setLoading(false);
  }

  // Adicionar novo link extra personalizado
  function handleAddExtraLink() {
    if (!newLinkTitle || !newLinkUrl) return;
    const updated = [...editLinksExtras, { title: newLinkTitle, url: newLinkUrl }];
    setEditLinksExtras(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
  }

  // Remover link extra personalizado
  function handleRemoveExtraLink(index: number) {
    const updated = editLinksExtras.filter((_, i) => i !== index);
    setEditLinksExtras(updated);
  }

  // Lógica de Reconhecimento de Voz (IA)
  function handleVoiceChat() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setAiResponse('Ouvindo...');
    };

    recognition.onresult = async (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiResponse(`Você disse: "${speechToText}". Processando...`);

      // TODO: Conectar com o serviço de IA (Gemini/OpenAI) aqui no próximo passo!
      setTimeout(() => {
        const mockResponse = `Olá! Eu sou a IA do ${perfil.nome}. Infelizmente minha API de voz está sendo finalizada, mas já ouvi você falar: "${speechToText}"!`;
        setAiResponse(mockResponse);
        
        // Fala de volta para o usuário
        const utterance = new SpeechSynthesisUtterance(mockResponse);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
        setIsRecording(false);
      }, 1500);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setAiResponse('Erro ao tentar te ouvir.');
    };

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
    }
  }

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500">Carregando...</div>;
  if (!perfil) return notFound();

  // Helper para identificar mídias de prévia (áudio/vídeo)
  const isVideoUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be') || url.includes('.mp4');
  const isAudioUrl = (url: string) => url.includes('.mp3') || url.includes('soundcloud.com') || url.includes('.wav');

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-yellow-500/30">
      
      {/* Botão de Ajustes (Editar Perfil) */}
      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="absolute top-6 right-6 p-3 bg-[#0a0a0a] border border-yellow-600/20 hover:border-yellow-500 text-yellow-500 rounded-full shadow-lg transition-all z-20"
      >
        ⚙️
      </button>

      <div className="w-full max-w-sm bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] backdrop-blur-xl text-center relative z-10">
        
        {/* Modo de Visualização do Perfil */}
        {!isEditing ? (
          <>
            {/* Foto de Perfil com upload direto */}
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full p-[2px] bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20 group cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer w-full h-full block">
                <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden flex items-center justify-center relative">
                  {perfil.avatar_url ? (
                    <img src={perfil.avatar_url} alt={perfil.nome} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
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
            <p className="text-yellow-600/80 text-sm mb-8 font-medium uppercase tracking-widest">{perfil.descricao || 'Slim Checkpoint'}</p>

            {/* Renderização dos botões */}
            <div className="space-y-4">
              {[
                { label: 'WhatsApp', href: perfil.whatsapp ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}` : null },
                { label: 'Instagram', href: perfil.link_instagram ? `https://instagram.com/${perfil.link_instagram.replace('@', '')}` : null },
                { label: 'Visite nosso Site', href: perfil.site_proprio ? (perfil.site_proprio.startsWith('http') ? perfil.site_proprio : `https://${perfil.site_proprio}`) : null },
              ].map((btn, i) => btn.href && (
                <a key={i} href={btn.href} target="_blank" rel="noopener noreferrer" 
                   className="block w-full py-3 bg-[#0f0f0f] border border-yellow-600/30 hover:border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] transition-all duration-300">
                  {btn.label}
                </a>
              ))}

              {/* Links Extras Dinâmicos (Previa integrada) */}
              {perfil.links_extras && perfil.links_extras.map((link: any, index: number) => (
                <div key={index} className="space-y-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" 
                     className="block w-full py-3 bg-gradient-to-r from-yellow-600/15 to-[#0f0f0f] border border-yellow-500/20 hover:border-yellow-500 text-white rounded-xl shadow-md transition-all duration-300">
                    {link.title}
                  </a>
                  
                  {/* Prévia Automática se for de Áudio ou Vídeo */}
                  {isVideoUrl(link.url) && (
                    <div className="rounded-lg overflow-hidden border border-yellow-600/10">
                      <iframe className="w-full h-44" src={link.url.replace("watch?v=", "embed/")} title="Preview" frameBorder="0" allowFullScreen></iframe>
                    </div>
                  )}
                  {isAudioUrl(link.url) && (
                    <div className="p-2 bg-[#121212] rounded-lg border border-yellow-600/10">
                      <audio controls className="w-full h-8">
                        <source src={link.url} type="audio/mpeg" />
                        Navegador não suporta áudio.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Painel de Edição do Perfil */
          <div className="text-left space-y-4">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 text-center">Configurações</h2>
            
            <div>
              <label className="text-xs text-gray-400">Nome</label>
              <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="text-xs text-gray-400">Descrição/Subtítulo</label>
              <input type="text" value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
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
              <label className="text-xs text-gray-400">Site Oficial</label>
              <input type="text" value={editSite} onChange={(e) => setEditSite(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-white" />
            </div>

            <hr className="border-yellow-600/20 my-4" />

            <h3 className="text-sm font-bold text-yellow-500">Links Extras & Prévias</h3>
            <div className="space-y-2">
              <input type="text" placeholder="Título (Ex: Meu Novo Single)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-xs" />
              <input type="text" placeholder="URL do Link (ou .mp3 / link YouTube)" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full bg-[#121212] border border-yellow-600/20 rounded-lg p-2 text-xs" />
              <button type="button" onClick={handleAddExtraLink} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-1.5 rounded-lg text-xs transition-all">
                + Adicionar Novo Link / Prévia
              </button>
            </div>

            {/* Listagem temporária dos links extras para remoção */}
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

        <footer className="mt-12 text-center animate-pulse">
          <p className="text-yellow-600/30 text-[9px] font-bold uppercase tracking-widest">Slim Checkpoint © 2026</p>
        </footer>
      </div>

      {/* 🎤 Widget de Conversa por Voz com IA */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2 z-30">
        {aiResponse && (
          <div className="max-w-[220px] bg-[#0a0a0a] border border-yellow-500/30 text-yellow-500 p-3 rounded-2xl text-xs shadow-lg animate-fade-in">
            {aiResponse}
          </div>
        )}
        <button 
          onClick={handleVoiceChat}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isRecording ? 'bg-red-600 animate-ping' : 'bg-yellow-500 hover:bg-yellow-400 text-black'
          }`}
        >
          {isRecording ? '🎙️ Gravando' : '🎤 Conversar por Voz'}
        </button>
      </div>
    </main>
  );
}