import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() (não getSession()) valida o token com o servidor
  // do Supabase — é o jeito seguro de checar quem está logado no proxy.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protege o dashboard: só quem estiver logado E na tabela `admins` entra.
  if (request.nextUrl.pathname.startsWith('/painel')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('erro', 'sem_permissao');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas exceto arquivos estáticos, para manter
     * a sessão sempre renovada — mas a checagem de admin acima só
     * bloqueia mesmo o /painel.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};