import { assertProfileLinks, type ProfileLink } from '../lib/profile';

export const siteUrl = new URL('https://julismo.vercel.app/');

// `title` e `description` vivem por cima do banner. `label` e `hint` são os chips, que também
// navegam o carrossel: têm de caber em 1/3 da coluna, por isso são curtos de propósito.
export const armSolutions = [
  {
    id: 'quotes',
    title: 'Orçamentos que chegam a tempo',
    description: 'Respostas rápidas, com margem protegida.',
    label: 'Orçamentos',
    hint: 'A tempo, com margem protegida',
    image: '/images/arm-solutions/quotes.webp',
  },
  {
    id: 'documents',
    title: 'Documentos prontos a faturar',
    description: 'Guias, CMR e POD organizados antes de bloquearem faturação.',
    label: 'Documentos',
    hint: 'Guias, CMR e POD prontos',
    image: '/images/arm-solutions/documents.webp',
  },
  {
    id: 'operations',
    title: 'Operação sob controlo',
    description: 'Prioridades, atrasos e pendências visíveis antes de virarem problemas.',
    label: 'Operação',
    hint: 'Atrasos visíveis a tempo',
    image: '/images/arm-solutions/operations.webp',
  },
] as const;

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
      href: 'https://api.whatsapp.com/send?phone=351933751885&text=Ol%C3%A1%2C%20Julismo.%20Vi%20o%20teu%20perfil%20e%20gostava%20de%20falar%20contigo.',
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
      id: 'email',
      title: 'Email',
      description: 'Escreve-me diretamente',
      href: 'mailto:julismocosta@gmail.com',
      icon: 'email',
      section: 'contact',
      external: false,
    },
    {
      id: 'arm',
      title: 'ARM Solutions',
      description: 'Para distribuição, transportes e logística',
      href: 'https://arm-lda.com/',
      icon: 'arm',
      section: 'solutions',
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
    {
      id: 'github',
      title: 'GitHub',
      description: 'Código e projetos open source',
      href: 'https://github.com/julismo',
      icon: 'github',
      section: 'presence',
      external: true,
    },
  ] satisfies ProfileLink[],
} as const;

assertProfileLinks(profile.links);
