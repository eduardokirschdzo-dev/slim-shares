export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl text-center">
        
        <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full mb-4 border-4 border-yellow-500 overflow-hidden">
        </div>

        <h1 className="text-2xl font-bold mb-2">{id}</h1>
        <p className="text-gray-400 mb-6">hello</p>

        <a 
          href="#" 
          className="block w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all"
        >
          WhatsApp
        </a>
      </div>
    </main>
  );
}