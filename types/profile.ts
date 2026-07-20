export interface LinkExtra {
  title: string;
  url: string;
}

export interface Profile {
  id: string;
  nome: string;
  bio?: string;
  whatsapp?: string;
  link_instagram?: string;
  musica_fundo?: string;
  foto_url?: string;
  links_extras?: LinkExtra[];
}

export interface ProfileAnalytics {
  totalAcessos: number;
  ultimoAcesso: string;
}