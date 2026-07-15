import Link from "next/link";

export default function PerfilNotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
        <p className="text-gray-400 mb-6">
          Esse perfil não existe ou não está disponível.
        </p>
        <Link
          href="/"
          className="block w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
