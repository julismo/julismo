import { describe, expect, test } from 'vitest';
import { profile } from '../../src/data/profile';
import { assertProfileLinks, validateProfileLinks, type ProfileLink } from '../../src/lib/profile';

const validLink: ProfileLink = {
  id: 'email',
  title: 'Email',
  description: 'Enviar uma mensagem',
  href: 'mailto:julismocosta@gmail.com',
  icon: 'email',
  external: false,
};

describe('profile link contract', () => {
  test('accepts the approved profile links', () => {
    expect(validateProfileLinks(profile.links)).toEqual([]);
    expect(() => assertProfileLinks(profile.links)).not.toThrow();
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
