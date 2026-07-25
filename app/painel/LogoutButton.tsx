'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        color: '#eab308',
        padding: '10px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.85rem',
      }}
    >
      Sair
    </button>
  );
}
