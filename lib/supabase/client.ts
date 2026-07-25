'use client';

import { createBrowserClient } from '@supabase/ssr';

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
 * Cliente Supabase para Client Components ('use client').
 * Usa cookies do navegador para manter a sessão de login (auth) sincronizada
 * com o servidor — necessário para as políticas de RLS reconhecerem quem
 * é o usuário logado (dono do perfil, admin, etc).
 *
 * Chame uma vez por componente, ex: const [supabase] = useState(() => createClient());
 */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
