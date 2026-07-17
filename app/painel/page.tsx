'use client';
// import dynamic from 'next/dynamic';
// const Background3D = dynamic(() => import('@/components/Background3D'), { ssr: false });

export default function Painel() {
  return (
    <div style={{ padding: 40, background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Teste de Painel</h1>
      <p>Se você está vendo isso, o caminho da pasta está CORRETO!</p>
    </div>
  );
}