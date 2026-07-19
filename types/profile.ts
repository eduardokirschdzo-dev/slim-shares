export interface Profile {
  id: string;
  nome: string;

  bio?: string;

  whatsapp?: string;

  link_instagram?: string;

  musica_fundo?: string;

  foto_url?: string;

  links_extras?: {
    title: string;
    url: string;
  }[];
}