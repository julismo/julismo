import { describe, expect, test } from 'vitest';
import { profile } from '../../src/data/profile';
import { assertProfileLinks, validateProfileLinks, type ProfileLink } from '../../src/lib/profile';

const validLink: ProfileLink = {
  id: 'email',
  title: 'Email',
  description: 'Enviar uma mensagem',
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
      { id: 'arm', title: 'ARM Solutions', description: 'IA e automação para PMEs', section: 'work' },
      { id: 'email', title: 'Email', description: 'Escreve-me diretamente', section: 'contact' },
      { id: 'github', title: 'GitHub', description: 'Código e projetos open source', section: 'contact' },
      { id: 'x', title: 'X', description: 'Ideias e atualizações', section: 'contact' },
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
