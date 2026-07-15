import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPerfilByIdentificador } from "@/app/lib/perfis";

type PerfilPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PerfilPageProps): Promise<Metadata> {
  const { id } = await params;
  const { perfil } = await getPerfilByIdentificador(id);

  if (!perfil) {
    return { title: "Perfil não encontrado" };
  }

  return {
    title: perfil.nome,
    description: perfil.bio ?? `Perfil de ${perfil.nome}`,
  };
}

export default async function PerfilPage({ params }: PerfilPageProps) {
  const { id } = await params;
  const { perfil, error } = await getPerfilByIdentificador(id);

  if (error || !perfil) {
    notFound();
  }

  const whatsappLink = perfil.whatsapp
    ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl text-center">
        <div className="relative w-32 h-32 mx-auto bg-gray-700 rounded-full mb-4 border-4 border-yellow-500 overflow-hidden">
          {perfil.foto_url ? (
            <Image
              src={perfil.foto_url}
              alt={perfil.nome}
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-400">
              {perfil.nome.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">{perfil.nome}</h1>
        <p className="text-gray-400 mb-6">{perfil.bio ?? "Sem descrição"}</p>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
          >
            WhatsApp
          </a>
        ) : (
          <p className="text-sm text-gray-500">WhatsApp não disponível</p>
        )}
      </div>
    </main>
  );
}
