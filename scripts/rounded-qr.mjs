import pngjs from 'pngjs';

const { PNG } = pngjs;
const FINDER_SIZE = 7;
const MODULE_RADIUS = 0.22;
const FINDER_POSITIONS = [
  ['top left', 0, 0],
  ['top right', (size) => size - FINDER_SIZE, 0],
  ['bottom left', 0, (size) => size - FINDER_SIZE],
];

const isFinderModule = (row, column, size) =>
  FINDER_POSITIONS.some(([, finderColumn, finderRow]) => {
    const left = typeof finderColumn === 'function' ? finderColumn(size) : finderColumn;
    const top = typeof finderRow === 'function' ? finderRow(size) : finderRow;

    return column >= left && column < left + FINDER_SIZE && row >= top && row < top + FINDER_SIZE;
  });

const getSize = (matrix) => {
  const size = matrix?.modules?.size;

  if (!Number.isInteger(size) || size < FINDER_SIZE) {
    throw new TypeError('A QR matrix with module dimensions is required.');
  }

  return size;
};

const getTotalSize = (matrix, margin) => {
  const size = getSize(matrix);

  if (!Number.isInteger(margin) || margin < 0) {
    throw new TypeError('margin must be a non-negative integer.');
  }

  return size + margin * 2;
};

const getColor = (color) => {
  const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color);

  if (!match) {
    throw new TypeError('PNG colors must use #RGB or #RRGGBB notation.');
  }

  const hex = match[1].length === 3
    ? [...match[1]].map((component) => component.repeat(2)).join('')
    : match[1];

  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    255,
  ];
};

const finderCoordinates = (size) => FINDER_POSITIONS.map(([label, column, row]) => [
  label,
  typeof column === 'function' ? column(size) : column,
  typeof row === 'function' ? row(size) : row,
]);

const svgRect = ({ x, y, width, height, radius, fill }) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>`;

/**
 * Renders a QR matrix as an SVG with a four-module quiet zone and stylised finder patterns.
 *
 * @param {{ modules: { size: number, data: Uint8Array } }} matrix
 * @param {{ margin: number, dark: string, light: string }} options
 * @returns {string}
 */
export const renderRoundedQrSvg = (matrix, { margin, dark, light }) => {
  const size = getSize(matrix);
  const totalSize = getTotalSize(matrix, margin);
  const modules = [];

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!matrix.modules.data[row * size + column] || isFinderModule(row, column, size)) continue;

      modules.push(svgRect({
        x: column + margin,
        y: row + margin,
        width: 1,
        height: 1,
        radius: MODULE_RADIUS,
        fill: dark,
      }));
    }
  }

  const finders = finderCoordinates(size).map(([label, column, row]) => {
    const x = column + margin;
    const y = row + margin;

    return `<g aria-label="Finder pattern ${label}">${[
      svgRect({ x, y, width: 7, height: 7, radius: 0.65, fill: dark }),
      svgRect({ x: x + 1, y: y + 1, width: 5, height: 5, radius: 0.48, fill: light }),
      svgRect({ x: x + 2, y: y + 2, width: 3, height: 3, radius: 0.38, fill: dark }),
    ].join('')}</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" role="img" aria-label="QR code"><rect width="${totalSize}" height="${totalSize}" fill="${light}"/>${modules.join('')}${finders.join('')}</svg>`;
};

const setPixel = (image, x, y, [red, green, blue, alpha]) => {
  const offset = (image.width * y + x) * 4;
  image.data[offset] = red;
  image.data[offset + 1] = green;
  image.data[offset + 2] = blue;
  image.data[offset + 3] = alpha;
};

const fillRoundedRect = (image, x, y, width, height, radius, color) => {
  const right = x + width;
  const bottom = y + height;
  const innerLeft = x + radius;
  const innerRight = right - radius;
  const innerTop = y + radius;
  const innerBottom = bottom - radius;
  const radiusSquared = radius * radius;

  for (let pixelY = Math.floor(y); pixelY < Math.ceil(bottom); pixelY += 1) {
    for (let pixelX = Math.floor(x); pixelX < Math.ceil(right); pixelX += 1) {
      const centerX = pixelX + 0.5;
      const centerY = pixelY + 0.5;
      const nearestX = Math.max(innerLeft, Math.min(centerX, innerRight));
      const nearestY = Math.max(innerTop, Math.min(centerY, innerBottom));
      const isInsideCorner = (centerX - nearestX) ** 2 + (centerY - nearestY) ** 2 <= radiusSquared;

      if (isInsideCorner) setPixel(image, pixelX, pixelY, color);
    }
  }
};

/**
 * Renders a QR matrix to a high-resolution PNG Buffer without a canvas dependency.
 *
 * @param {{ modules: { size: number, data: Uint8Array } }} matrix
 * @param {{ margin: number, modulePixels: number, dark: string, light: string }} options
 * @returns {Buffer}
 */
export const renderRoundedQrPng = (matrix, { margin, modulePixels, dark, light }) => {
  const size = getSize(matrix);
  const totalSize = getTotalSize(matrix, margin);

  if (!Number.isInteger(modulePixels) || modulePixels < 1) {
    throw new TypeError('modulePixels must be a positive integer.');
  }

  const darkColor = getColor(dark);
  const lightColor = getColor(light);
  const image = new PNG({ width: totalSize * modulePixels, height: totalSize * modulePixels });

  fillRoundedRect(image, 0, 0, image.width, image.height, 0, lightColor);

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (!matrix.modules.data[row * size + column] || isFinderModule(row, column, size)) continue;

      fillRoundedRect(
        image,
        (column + margin) * modulePixels,
        (row + margin) * modulePixels,
        modulePixels,
        modulePixels,
        MODULE_RADIUS * modulePixels,
        darkColor,
      );
    }
  }

  for (const [, column, row] of finderCoordinates(size)) {
    const x = (column + margin) * modulePixels;
    const y = (row + margin) * modulePixels;

    fillRoundedRect(image, x, y, 7 * modulePixels, 7 * modulePixels, 0.65 * modulePixels, darkColor);
    fillRoundedRect(image, x + modulePixels, y + modulePixels, 5 * modulePixels, 5 * modulePixels, 0.48 * modulePixels, lightColor);
    fillRoundedRect(image, x + 2 * modulePixels, y + 2 * modulePixels, 3 * modulePixels, 3 * modulePixels, 0.38 * modulePixels, darkColor);
  }

  return PNG.sync.write(image);
};
