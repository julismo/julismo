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
      title: 'WhatsApp',
      description: 'Conversar diretamente',
      href: 'https://api.whatsapp.com/send?phone=351933751885',
      icon: 'whatsapp',
      external: false,
      primary: true,
    },
    {
      id: 'arm',
      title: 'ARM Solutions',
      description: 'IA e automação para PMEs',
      href: 'https://arm-lda.com/',
      icon: 'arm',
      external: true,
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Enviar uma mensagem',
      href: 'mailto:julismocosta@gmail.com',
      icon: 'email',
      external: false,
    },
    {
      id: 'github',
      title: 'GitHub',
      description: 'Projetos e código',
      href: 'https://github.com/julismo',
      icon: 'github',
      external: true,
    },
    {
      id: 'x',
      title: 'X',
      description: 'Atualizações e ideias',
      href: 'https://x.com/_Julismo',
      icon: 'x',
      external: true,
    },
  ] satisfies ProfileLink[],
} as const;

assertProfileLinks(profile.links);
