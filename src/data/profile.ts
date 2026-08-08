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
      id: 'cal',
      title: 'Agendar diagnóstico',
      description: '30 min · escolha o melhor horário',
      href: 'https://cal.com/julismo-costa-3nxpms/30min',
      icon: 'cal',
      section: 'contact',
      external: true,
      interaction: 'cal-dialog',
    },
    {
      id: 'arm',
      title: 'ARM Solutions',
      description: 'IA e automação para PMEs',
      href: 'https://arm-lda.com/',
      icon: 'arm',
      section: 'solutions',
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
      section: 'presence',
      external: true,
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      description: 'Perfil profissional',
      href: 'https://www.linkedin.com/in/julismocosta/',
      icon: 'linkedin',
      section: 'presence',
      external: true,
    },
  ] satisfies ProfileLink[],
} as const;

assertProfileLinks(profile.links);
