export interface LinkExtra {
  title: string;
  url: string;
}

export interface ProfileAnalytics {
  totalAcessos: number;
  ultimoAcesso: string;
}

export interface Profile {
  id: string;
  nome: string;
  bio?: string;
  whatsapp?: string;
  link_instagram?: string;
  musica_fundo?: string;
  /** URL do link de agendamento (Cal.com, Calendly, WhatsApp etc.) */
  agenda_url?: string;
  foto_url?: string;
  links_extras?: LinkExtra[];
  /** uuid do usuário (Supabase Auth) dono deste perfil. null = perfil ainda não reivindicado. */
  owner_id?: string | null;
}

// Dados enviados pelo formulário de ativação (app/ativar/page.tsx)
export interface DadosPerfil {
  nome: string;
  whatsapp: string;
  link_instagram: string;
}