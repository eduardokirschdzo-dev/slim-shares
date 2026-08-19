import { redirect } from 'next/navigation';

// TODO: id fixo temporário até existir uma home de verdade (landing, ou
// redirect configurável por variável de ambiente). Redirect agora roda no
// servidor — sem o flash de "Redirecionando..." que existia na versão
// client-side, que também tinha um placeholder de comentário nunca
// preenchido (mas o ID já estava certo, '01').
const ID_PADRAO = '01';

export default function HomePage() {
  redirect(`/perfil/${ID_PADRAO}`);
}