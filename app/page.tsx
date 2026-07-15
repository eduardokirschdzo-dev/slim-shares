import Link from "next/link";
import { listPerfis } from "@/app/lib/perfis";

export default async function HomePage() {
  const perfis = await listPerfis();

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">Slim Shares</h1>
        <p className="text-gray-400 text-center mb-8">
          Perfis públicos compartilháveis
        </p>

        {perfis.length > 0 ? (
          <ul className="space-y-3">
            {perfis.map((perfil) => (
              <li key={perfil.id}>
                <Link
                  href={`/perfil/${perfil.slug}`}
                  className="block rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 hover:border-yellow-500 transition-colors"
                >
                  <span className="font-semibold">{perfil.nome}</span>
                  {perfil.bio && (
                    <span className="block text-sm text-gray-400 truncate">
                      {perfil.bio}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400 rounded-xl border border-gray-700 bg-gray-800 px-4 py-6">
            Nenhum perfil encontrado. Acesse{" "}
            <code className="text-yellow-500">/perfil/seu-slug</code> após
            cadastrar dados no Supabase.
          </p>
        )}
      </div>
    </main>
  );
}
