import QRCode from 'qrcode';
import { readFile } from 'node:fs/promises';
import pngjs from 'pngjs';
import { expect, test } from 'vitest';
import { renderRoundedQrPng, renderRoundedQrSvg } from '../../scripts/rounded-qr.mjs';

const { PNG } = pngjs;
const target = 'https://julismo.vercel.app/';
const matrix = QRCode.create(target, { errorCorrectionLevel: 'H' });
const pixelAt = (image, x, y) => [...image.data.slice((image.width * y + x) * 4, (image.width * y + x + 1) * 4)];

test('renders a rounded QR code with an unobstructed quiet zone and finder patterns', () => {
  const svg = renderRoundedQrSvg(matrix, {
    margin: 4,
    dark: '#0A0A0B',
    light: '#FFFFFF',
  });
  const png = renderRoundedQrPng(matrix, {
    margin: 4,
    modulePixels: 32,
    dark: '#0A0A0B',
    light: '#FFFFFF',
  });

  expect(svg).toContain(`viewBox="0 0 ${matrix.modules.size + 8} ${matrix.modules.size + 8}"`);
  expect(svg).toContain('rx="0.22"');
  expect(svg).toContain('aria-label="Finder pattern top left"');
  expect(svg).toContain('aria-label="Finder pattern top right"');
  expect(svg).toContain('aria-label="Finder pattern bottom left"');
  expect(svg).not.toContain('shape-rendering="crispEdges"');
  expect(Buffer.isBuffer(png)).toBe(true);
  expect(png.length).toBeGreaterThan(0);
});

test('publishes a white-on-black QR for the card artwork', async () => {
  const [svg, cardSvg, png] = await Promise.all([
    readFile(new URL('../../public/qr/julismo.svg', import.meta.url), 'utf8'),
    readFile(new URL('../../public/qr/julismo-card.svg', import.meta.url), 'utf8'),
    readFile(new URL('../../public/qr/julismo.png', import.meta.url)),
  ]);
  const image = PNG.sync.read(png);

  expect(svg).toContain('fill="#000000"');
  expect(svg).toContain('fill="#FFFFFF"');
  expect(cardSvg).toContain('width="624" height="624" rx="34" fill="#000000"');
  expect(pixelAt(image, 0, 0)).toEqual([0, 0, 0, 255]);
  expect(pixelAt(image, 4 * 40 + 20, 4 * 40 + 20)).toEqual([255, 255, 255, 255]);
});
