# Inverted QR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a scan-safe white-on-black Julismo QR that fits the approved Canva business-card artwork.

**Architecture:** Keep the existing trusted H-level QR matrix and pure JavaScript renderer. Invert only the renderer's active-module and background colour options, and make the decorative card's QR panel black to match. Tests assert output colours and all assets are independently decoded after regeneration.

**Tech Stack:** Node.js, `qrcode`, `pngjs`, Vitest, OpenCV.

## Global Constraints

- Encode exactly `https://julismo.vercel.app/` with error-correction level H.
- Use white rounded data modules and inverse finder patterns on a solid black field.
- Preserve a continuous four-module black quiet zone and do not add artwork inside it.
- Generate `julismo.svg`, `julismo.png`, and `julismo-card.svg` locally; retain the static, provider-free design.
- Do not change the site's profile links, card composition, or visual system.

---

### Task 1: Invert and verify the reusable QR assets

**Files:**
- Modify: `tests/unit/rounded-qr.test.js`
- Modify: `scripts/generate-qr.mjs`
- Modify: `README.md`
- Regenerate: `public/qr/julismo.svg`
- Regenerate: `public/qr/julismo.png`
- Regenerate: `public/qr/julismo-card.svg`

**Interfaces:**
- Consumes: `renderRoundedQrSvg(matrix, { margin, dark, light })` and `renderRoundedQrPng(matrix, { margin, modulePixels, dark, light })`.
- Produces: white `dark` modules (`#FFFFFF`) on black `light` field (`#000000`) in all three QR assets.

- [ ] **Step 1: Make the renderer contract fail for the inverted palette**

  Keep the renderer unit test, then add a second asynchronous test that reads the checked-in generated assets. Its exact assertions must fail against the current black-on-white artwork:

  ```js
  import { readFile } from 'node:fs/promises';
  import pngjs from 'pngjs';

  const { PNG } = pngjs;
  const pixelAt = (image, x, y) => [...image.data.slice((image.width * y + x) * 4, (image.width * y + x + 1) * 4)];

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
  ```

- [ ] **Step 2: Run the focused unit test red**

  Run: `npx vitest run tests/unit/rounded-qr.test.js`

  Expected: FAIL in `publishes a white-on-black QR for the card artwork` because the checked-in generator output still uses `#0A0A0B` modules on a white field.

- [ ] **Step 3: Use the approved inverse palette in the generator**

  In `scripts/generate-qr.mjs`, use:

  ```js
  const qrOptions = {
    margin: 4,
    dark: '#FFFFFF',
    light: '#000000',
  };
  ```

  Replace the white card QR panel and silver border with a black panel and a restrained graphite border:

  ```xml
  <rect x="48" y="48" width="624" height="624" rx="34" fill="#000000"/>
  <rect x="48.75" y="48.75" width="622.5" height="622.5" rx="33.25" fill="none" stroke="#3f3f46" stroke-width="1.5"/>
  ```

  In `README.md`, describe the QR as white modules on a black reading field, with a protected black quiet zone.

- [ ] **Step 4: Run the focused test green and regenerate assets**

  Run: `npx vitest run tests/unit/rounded-qr.test.js && npm run generate:qr`

  Expected: both focused QR tests pass and all three QR assets are rewritten with the inverse palette.

- [ ] **Step 5: Decode all regenerated formats and copy the Canva file**

  Rasterise both SVGs with CairoSVG and decode them with OpenCV together with `public/qr/julismo.png`. Each decoder result must equal `https://julismo.vercel.app/`.

  Copy the confirmed PNG without replacing the prior black asset:

  ```powershell
  Copy-Item -LiteralPath 'public\qr\julismo.png' -Destination 'C:\Users\julis\Downloads\QR-JULISMO-BRANCO-FINAL.png'
  ```

- [ ] **Step 6: Run the full verification and commit**

  Run: `npm test && npm run build`

  Expected: Astro has zero diagnostics, all Vitest tests pass, all applicable Playwright tests pass, and the production build succeeds.

  Commit the changed test, generator, README, and generated QR assets with:

  ```bash
  git add tests/unit/rounded-qr.test.js scripts/generate-qr.mjs README.md public/qr/julismo.svg public/qr/julismo.png public/qr/julismo-card.svg
  git commit -m "feat: invert QR artwork for black cards"
  ```
