export default async function TestePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: 40 }}>
      <h1>Rota funcionando</h1>
      <p>ID recebido: {id}</p>
    </main>
  );
}
