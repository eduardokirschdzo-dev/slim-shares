'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProfileEditorProps {
  initialData: {
    id: string;
    full_name: string;
    bio: string;
  };
}

export default function ProfileEditor({ initialData }: ProfileEditorProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, updated_at: new Date() })
      .eq('id', initialData.id);

    if (error) {
      setMessage('Erro ao atualizar perfil.');
    } else {
      setMessage('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4 max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Editar Perfil</h2>
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome Completo</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </button>

      {message && <p className="text-sm text-center mt-2 text-emerald-500 font-medium">{message}</p>}
    </form>
  );
}