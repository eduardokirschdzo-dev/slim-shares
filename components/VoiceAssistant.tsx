'use client';

import { useState, useEffect } from 'react';

interface VoiceAssistantProps {
  profileNome: string;
  profileBio: string;
}

export default function VoiceAssistant({ profileNome, profileBio }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  // Truque para iOS/Android: Destrava o motor de voz no primeiro toque da tela
  useEffect(() => {
    const destravarAudioCelular = () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
      }
      window.removeEventListener('touchstart', destravarAudioCelular);
      window.removeEventListener('click', destravarAudioCelular);
    };

    window.addEventListener('touchstart', destravarAudioCelular);
    window.addEventListener('click', destravarAudioCelular);

    return () => {
      window.removeEventListener('touchstart', destravarAudioCelular);
      window.removeEventListener('click', destravarAudioCelular);
    };
  }, []);

  function handleVoiceChat() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setAiResponse('Estou ouvindo...');
    };

    recognition.onresult = async (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiResponse(`Processando...`);

      let respostaIA = `Olá! Sou o assistente do ${profileNome}. Você disse "${speechToText}". Como posso te ajudar?`;
      
      const textoNormalizado = speechToText.toLowerCase();
      if (textoNormalizado.includes('whatsapp') || textoNormalizado.includes('contato') || textoNormalizado.includes('falar com')) {
        respostaIA = `Para falar com ${profileNome}, clique no botão do WhatsApp na tela!`;
      } else if (textoNormalizado.includes('instagram') || textoNormalizado.includes('rede social')) {
        respostaIA = `Siga o perfil do Instagram clicando no botão correspondente na tela!`;
      } else if (textoNormalizado.includes('quem é') || textoNormalizado.includes('sobre')) {
        respostaIA = `Este é o perfil de ${profileNome}. A biografia diz: ${profileBio || 'Sem descrição cadastrada.'}`;
      }

      setAiResponse(respostaIA);
      setIsRecording(false);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(respostaIA);
        utterance.lang = 'pt-BR';
        
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang.includes('pt-BR'));
        if (ptVoice) utterance.voice = ptVoice;

        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setAiResponse('Não consegui te ouvir direito.');
    };

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2 z-30">
      {aiResponse && (
        <div className="max-w-[220px] bg-[#0a0a0a] border border-yellow-500/30 text-yellow-500 p-3 rounded-2xl text-xs shadow-lg mb-1">
          {aiResponse}
        </div>
      )}
      <button 
        onClick={handleVoiceChat}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center text-2xl border-none focus:outline-none ${
          isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-yellow-500 text-black'
        }`}
      >
        {isRecording ? '🎙️' : '🎤'}
      </button>
    </div>
  );
}