import { mkdir, writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';
import { renderRoundedQrPng, renderRoundedQrSvg } from './rounded-qr.mjs';

const target = new URL(process.env.QR_TARGET ?? 'https://julismo.vercel.app/');

if (target.protocol !== 'https:' || !target.hostname) {
  throw new Error('QR_TARGET must be a complete HTTPS URL.');
}

const outputDirectory = 'public/qr';
const qrOptions = {
  margin: 4,
  dark: '#FFFFFF',
  light: '#000000',
};
const matrix = QRCode.create(target.href, { errorCorrectionLevel: 'H' });
const plainSvg = renderRoundedQrSvg(matrix, qrOptions);
const viewBox = `0 0 ${matrix.modules.size + qrOptions.margin * 2} ${matrix.modules.size + qrOptions.margin * 2}`;
const innerSvg = plainSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];

if (!innerSvg) {
  throw new Error('The rounded QR renderer did not return SVG content.');
}

const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="846" viewBox="0 0 720 846" role="img" aria-labelledby="title description">
  <title id="title">QR code de Julismo</title>
  <desc id="description">Abre ${target.href}</desc>
  <rect width="720" height="846" rx="54" fill="#101011"/>
  <rect x="48" y="48" width="624" height="624" rx="34" fill="#000000"/>
  <rect x="48.75" y="48.75" width="622.5" height="622.5" rx="33.25" fill="none" stroke="#3f3f46" stroke-width="1.5"/>
  <svg x="93" y="93" width="534" height="534" viewBox="${viewBox}" role="img" aria-label="QR code">${innerSvg}</svg>
  <path d="M166 725h388" stroke="#5a5a61" stroke-width="1"/>
  <text x="360" y="770" fill="#f5f5f7" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" letter-spacing="7" text-anchor="middle">JULISMO</text>
  <text x="360" y="803" fill="#a5a5ad" font-family="Arial, Helvetica, sans-serif" font-size="16" letter-spacing="1.2" text-anchor="middle">julismo.vercel.app</text>
</svg>`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(`${outputDirectory}/julismo.svg`, plainSvg, 'utf8');
await writeFile(`${outputDirectory}/julismo-card.svg`, cardSvg, 'utf8');
await writeFile(
  `${outputDirectory}/julismo.png`,
  renderRoundedQrPng(matrix, { ...qrOptions, modulePixels: 40 }),
);

console.log(`QR code generated for ${target.href}`);
