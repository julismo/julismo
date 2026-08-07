import { mkdir, writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

const target = new URL(process.env.QR_TARGET ?? 'https://julismo.vercel.app/');

if (target.protocol !== 'https:' || !target.hostname) {
  throw new Error('QR_TARGET must be a complete HTTPS URL.');
}

const outputDirectory = 'public/qr';
const qrOptions = {
  errorCorrectionLevel: 'H',
  margin: 4,
  color: {
    dark: '#0A0A0B',
    light: '#FFFFFF',
  },
};

/** @returns {Promise<string>} */
const renderSvg = () =>
  new Promise((resolve, reject) => {
    QRCode.toString(target.href, { ...qrOptions, type: 'svg' }, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });

/** @returns {Promise<void>} */
const writePng = () =>
  new Promise((resolve, reject) => {
    QRCode.toFile(
      `${outputDirectory}/julismo.png`,
      target.href,
      { ...qrOptions, type: 'png', width: 1536 },
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });

await mkdir(outputDirectory, { recursive: true });

const plainSvg = await renderSvg();

const viewBox = plainSvg.match(/viewBox="([^"]+)"/)?.[1];
const innerSvg = plainSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];

if (!viewBox || !innerSvg) {
  throw new Error('The QR generator did not return an SVG with a viewBox.');
}

const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="846" viewBox="0 0 720 846" role="img" aria-labelledby="title description">
  <title id="title">QR code de Julismo</title>
  <desc id="description">Abre ${target.href}</desc>
  <rect width="720" height="846" rx="54" fill="#101011"/>
  <rect x="48" y="48" width="624" height="624" rx="34" fill="#ffffff"/>
  <rect x="48.75" y="48.75" width="622.5" height="622.5" rx="33.25" fill="none" stroke="#d4d4d8" stroke-width="1.5"/>
  <svg x="93" y="93" width="534" height="534" viewBox="${viewBox}" shape-rendering="crispEdges">${innerSvg}</svg>
  <path d="M166 725h388" stroke="#5a5a61" stroke-width="1"/>
  <text x="360" y="770" fill="#f5f5f7" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700" letter-spacing="7" text-anchor="middle">JULISMO</text>
  <text x="360" y="803" fill="#a5a5ad" font-family="Arial, Helvetica, sans-serif" font-size="16" letter-spacing="1.2" text-anchor="middle">julismo.vercel.app</text>
</svg>`;

await writeFile(`${outputDirectory}/julismo.svg`, plainSvg, 'utf8');
await writeFile(`${outputDirectory}/julismo-card.svg`, cardSvg, 'utf8');
await writePng();

console.log(`QR code generated for ${target.href}`);
