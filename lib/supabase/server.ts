import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'A variável de ambiente NEXT_PUBLIC_SUPABASE_URL não foi definida.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'A variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não foi definida.'
  );
}

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê/escreve a sessão de login através dos cookies da requisição, para que
 * o Postgres saiba (via auth.uid()) quem está pedindo os dados — isso é o
 * que permite as políticas de RLS liberarem ou bloquearem cada linha.
 *
 * IMPORTANTE: crie uma instância nova a cada request
 * (não reutilize entre requisições diferentes).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado a partir de um Server Component (não pode setar cookies).
          // Sem problema: o middleware.ts já cuida de renovar a sessão.
        }
      },
    },
  });
}
