import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

test('the unit test runner is configured', () => {
  expect(import.meta.env.MODE).toBe('test');
});

test('Vercel deploys the built Astro output', () => {
  const configPath = fileURLToPath(new URL('../../vercel.json', import.meta.url));

  expect(existsSync(configPath)).toBe(true);

  const config = JSON.parse(readFileSync(configPath, 'utf8')) as Record<string, string>;

  expect(config.framework).toBe('astro');
  expect(config.buildCommand).toBe('npm run build');
  expect(config.outputDirectory).toBe('dist');
});

test('browser checks use the managed Chromium channel', () => {
  const configPath = fileURLToPath(new URL('../../playwright.config.ts', import.meta.url));
  const config = readFileSync(configPath, 'utf8');

  expect(config).toContain("channel: 'chromium'");
});
