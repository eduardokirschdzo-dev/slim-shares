'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Substitua 'SEU_ID_PRINCIPAL' pelo ID do perfil que você quer que abra por padrão
    const ID_PADRAO = '01'; 
    router.push(`/perfil/${ID_PADRAO}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <p className="text-yellow-600/50 animate-pulse uppercase tracking-widest text-xs">
        Redirecionando Slim Checkpoint...
      </p>
    </div>
  );
}