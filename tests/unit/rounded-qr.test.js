import QRCode from 'qrcode';
import { expect, test } from 'vitest';
import { renderRoundedQrPng, renderRoundedQrSvg } from '../../scripts/rounded-qr.mjs';

const target = 'https://julismo.vercel.app/';
const matrix = QRCode.create(target, { errorCorrectionLevel: 'H' });

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
