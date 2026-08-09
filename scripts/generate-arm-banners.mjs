import { access, mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTH = 1176;
const HEIGHT = 504;
const MIN_FILE_BYTES = 12 * 1024;
const MAX_FILE_BYTES = 100 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024;
const names = ['quotes', 'documents', 'operations'];
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = join(root, '.superpowers', 'arm-banner-sources');
const outputDirectory = join(root, 'public', 'images', 'arm-solutions');

await mkdir(outputDirectory, { recursive: true });

const generated = [];

for (const name of names) {
  const source = join(sourceDirectory, `${name}.png`);
  const output = join(outputDirectory, `${name}.webp`);

  try {
    await access(source);
  } catch {
    throw new Error(`Missing ImageGen source: ${source}`);
  }

  await sharp(source)
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(output);

  const { size } = await stat(output);

  if (size < MIN_FILE_BYTES || size > MAX_FILE_BYTES) {
    throw new Error(`${name}.webp must be between ${MIN_FILE_BYTES} and ${MAX_FILE_BYTES} bytes; received ${size}.`);
  }

  generated.push({ name, size });
}

const totalBytes = generated.reduce((total, file) => total + file.size, 0);

if (totalBytes > MAX_TOTAL_BYTES) {
  throw new Error(`ARM banners exceed the ${MAX_TOTAL_BYTES}-byte total limit: ${totalBytes} bytes.`);
}

for (const { name, size } of generated) {
  console.log(`${name}.webp: ${size} bytes`);
}

console.log(`Total: ${totalBytes} bytes`);
