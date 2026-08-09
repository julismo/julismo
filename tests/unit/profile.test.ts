import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { armSolutions, profile } from '../../src/data/profile';
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

function readVp8WebpSize(path: string) {
  const bytes = readFileSync(path);

  expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
  expect(bytes.subarray(12, 16).toString('ascii')).toBe('VP8 ');
  expect(bytes.subarray(23, 26).toString('hex')).toBe('9d012a');

  return {
    width: bytes.readUInt16LE(26) & 0x3fff,
    height: bytes.readUInt16LE(28) & 0x3fff,
  };
}

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
      { id: 'arm', title: 'ARM Solutions', description: 'Para distribuição, transportes e logística', section: 'solutions' },
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

  test('defines the approved ARM solutions', () => {
    expect(armSolutions).toEqual([
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
    ]);
  });

  test('keeps chip copy short enough for three columns', () => {
    // Os chips ocupam 1/3 da coluna de 430px. Foi o que partiu a primeira versão:
    // usava o título completo e rebentava para três linhas em cada chip.
    for (const solution of armSolutions) {
      expect(solution.label.length, `${solution.id} label`).toBeLessThanOrEqual(14);
      expect(solution.hint.length, `${solution.id} hint`).toBeLessThanOrEqual(34);
      expect(solution.label).not.toEqual(solution.title);
    }
  });

  test('keeps ARM visual assets local and within the mobile budget', () => {
    const imagePaths = armSolutions.map((solution) => (solution as { image?: string }).image);

    expect(imagePaths).toEqual([
      '/images/arm-solutions/quotes.webp',
      '/images/arm-solutions/documents.webp',
      '/images/arm-solutions/operations.webp',
    ]);

    const assets = imagePaths.map((image) => join(process.cwd(), 'public', image!));
    expect(assets.every(existsSync)).toBe(true);
    const sizes = assets.map((asset) => statSync(asset).size);
    expect(sizes.every((size) => size >= 12 * 1024 && size <= 100 * 1024)).toBe(true);
    expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(300 * 1024);
    expect(assets.map(readVp8WebpSize)).toEqual([
      { width: 1176, height: 504 },
      { width: 1176, height: 504 },
      { width: 1176, height: 504 },
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
