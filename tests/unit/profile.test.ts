import { describe, expect, test } from 'vitest';
import { profile } from '../../src/data/profile';
import { assertProfileLinks, validateProfileLinks, type ProfileLink } from '../../src/lib/profile';

const validLink: ProfileLink = {
  id: 'email',
  title: 'Email',
  description: 'Escreve-me diretamente',
  href: 'mailto:julismocosta@gmail.com',
  icon: 'email',
  section: 'contact',
  external: false,
};

describe('profile link contract', () => {
  test('accepts the approved profile links', () => {
    expect(validateProfileLinks(profile.links)).toEqual([]);
    expect(() => assertProfileLinks(profile.links)).not.toThrow();
  });

  test('keeps the approved visual hierarchy and microcopy', () => {
    expect(profile.links.map(({ id, title, description, section }) => ({ id, title, description, section }))).toEqual([
      { id: 'whatsapp', title: 'Falar comigo', description: 'WhatsApp · resposta direta', section: 'contact' },
      { id: 'cal', title: 'Agendar diagnóstico', description: '30 min · escolha o melhor horário', section: 'contact' },
      { id: 'email', title: 'Email', description: 'Escreve-me diretamente', section: 'contact' },
      { id: 'arm', title: 'ARM Solutions', description: 'IA e automação para PMEs', section: 'solutions' },
      { id: 'linkedin', title: 'LinkedIn', description: 'Perfil profissional', section: 'presence' },
      { id: 'github', title: 'GitHub', description: 'Código e projetos open source', section: 'presence' },
    ]);
  });

  test('keeps every approved destination and navigation policy', () => {
    expect(profile.links.map(({ id, href, external }) => ({ id, href, external }))).toEqual([
      {
        id: 'whatsapp',
        href: 'https://api.whatsapp.com/send?phone=351933751885&text=Ol%C3%A1%2C%20Julismo.%20Vi%20o%20teu%20perfil%20e%20gostava%20de%20falar%20contigo.',
        external: false,
      },
      { id: 'cal', href: 'https://cal.com/julismo-costa-3nxpms/30min', external: true },
      { id: 'email', href: 'mailto:julismocosta@gmail.com', external: false },
      { id: 'arm', href: 'https://arm-lda.com/', external: true },
      { id: 'linkedin', href: 'https://www.linkedin.com/in/julismocosta/', external: true },
      { id: 'github', href: 'https://github.com/julismo', external: true },
    ]);
  });

  test('rejects duplicate IDs, absent copy and unsafe schemes', () => {
    const invalid: ProfileLink[] = [
      validLink,
      { ...validLink, title: '', href: 'javascript:alert(1)' },
    ];

    expect(validateProfileLinks(invalid)).toEqual([
      'duplicate id: email',
      'email is missing a title',
      'email has an unsupported URL scheme',
    ]);
  });
});
