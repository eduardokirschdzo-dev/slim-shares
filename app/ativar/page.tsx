import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { buscarPerfil } from '../../services/profileService';
import FormularioNovaConta from './FormularioNovaConta';
import FormularioDadosCartao from './FormularioDadosCartao';

/**
 * Server Component: decide qual formulário mostrar ANTES de renderizar nada,
 * consultando se já existe sessão e se o perfil já tem dono. É essa checagem
 * que faltava — antes, a página sempre mostrava o formulário de cadastro
 * completo (com signUp), mesmo para quem voltava de /entrar já logado depois
 * de confirmar o e-mail. Isso causava o loop de "confirme seu e-mail" mesmo
 * já confirmado, porque o signUp() era chamado de novo para uma conta que já
 * existia.
 */
export default async function AtivacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = await searchParams;
  const id = (search.tag as string) || (search.id as string);

  let conteudo: React.ReactNode;

  if (!id) {
    conteudo = (
      <p className="text-red-400 text-sm">ID do cartão não encontrado na URL.</p>
    );
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const perfilExistente = await buscarPerfil(supabase, id);

    if (perfilExistente?.owner_id) {
      // Cartão já ativado. Se for o dono, não faz sentido mostrar formulário.
      if (user && perfilExistente.owner_id === user.id) {
        redirect(`/perfil/${id}`);
      }
      conteudo = (
        <p className="text-yellow-600/80 text-sm">
          Este cartão já foi ativado. Se você é o dono e está com problemas
          para acessar, fale com o suporte.
        </p>
      );
    } else if (user) {
      // Já logado (ex: voltando de /entrar após confirmar e-mail) — só falta
      // vincular o cartão, sem repetir cadastro.
      conteudo = <FormularioDadosCartao id={id} userId={user.id} />;
    } else {
      // Ninguém logado ainda — fluxo completo de criação de conta + ativação.
      conteudo = <FormularioNovaConta id={id} />;
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-3xl border border-yellow-600/20 shadow-[0_0_50px_-12px_rgba(202,138,4,0.15)] text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-600/10 flex items-center justify-center border border-yellow-600/30">
          <span className="text-2xl">⚡</span>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Ativação Slim
        </h1>

        {conteudo}
      </div>
    </main>
  );
}