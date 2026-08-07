import { assertProfileLinks, type ProfileLink } from '../lib/profile';

export const siteUrl = new URL('https://julismo.vercel.app/');

export const profile = {
  name: 'Julismo',
  fullName: 'Julismo Costa',
  bio: 'Simplifico processos que atrasam a equipa, sem trocar o que já funciona.',
  image: '/images/julismo-profile.png',
  links: [
    {
      id: 'whatsapp',
      title: 'Falar comigo',
      description: 'WhatsApp · resposta direta',
      href: 'https://api.whatsapp.com/send?phone=351933751885',
      icon: 'whatsapp',
      section: 'contact',
      external: false,
      primary: true,
    },
    {
      id: 'arm',
      title: 'ARM Solutions',
      description: 'IA e automação para PMEs',
      href: 'https://arm-lda.com/',
      icon: 'arm',
      section: 'work',
      external: true,
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Escreve-me diretamente',
      href: 'mailto:julismocosta@gmail.com',
      icon: 'email',
      section: 'contact',
      external: false,
    },
    {
      id: 'github',
      title: 'GitHub',
      description: 'Código e projetos open source',
      href: 'https://github.com/julismo',
      icon: 'github',
      section: 'contact',
      external: true,
    },
    {
      id: 'x',
      title: 'X',
      description: 'Ideias e atualizações',
      href: 'https://x.com/_Julismo',
      icon: 'x',
      section: 'contact',
      external: true,
    },
  ] satisfies ProfileLink[],
} as const;

assertProfileLinks(profile.links);
