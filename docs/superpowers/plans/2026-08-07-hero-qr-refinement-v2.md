# Hero, Verification Badge, and Rounded QR Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the hero into a true cover-banner composition, use the generated rounded-check badge safely, enlarge the mobile hierarchy, and generate scan-safe rounded QR assets.

**Architecture:** `ProfileHero` remains the page's identity component, but its existing banner becomes an in-flow full-bleed cover and the portrait overlaps its lower edge. A static image replaces the previous inline verification SVG. A small pure JavaScript QR renderer consumes the already trusted `qrcode` matrix and emits rounded SVG and PNG artwork without native canvas dependencies.

**Tech Stack:** Astro 5, CSS, Node.js, `qrcode`, `pngjs`, Playwright, Vitest, OpenCV for release decoding.

## Global Constraints

- Preserve copy, five destinations, card order, icon set, black/silver palette, orientation effect, reduced-motion behaviour, vertical navigation, and no horizontal scrolling.
- The cover uses `public/images/julismo-hero-wave.png`; it is decorative, full-bleed, and the portrait overlaps its lower edge at the horizontal centre.
- Use only `public/images/julismo-verified-rosette-rounded.png` for the generated badge. It must use empty `alt`, `aria-hidden="true"`, and a CSS box large enough not to crop it. Remove unused generated badge variants before commit.
- Keep the background illumination fixed to the viewport and below the page shell.
- QR assets encode exactly `https://julismo.vercel.app/`, use error-correction level H, retain a 4-module black quiet zone, use `#FFFFFF` modules on `#000000`, and have no logo or artwork inside the QR reading area.
- QR data modules and finder patterns may be rounded; finder patterns must remain three high-contrast inverse 7-by-7 structures with a white outer ring, black separator, and white centre. This final palette supersedes the earlier black-on-white examples in Task 3; `docs/superpowers/specs/2026-08-07-inverted-qr-design.md` is the binding QR visual contract.
- Test at 320 px and 390 px and decode the generated pure SVG, branded card SVG, and PNG before publishing.

---

### Task 1: Extend the visual regression contract

**Files:**
- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: `.profile-hero__banner`, `.profile-hero__image`, `.verified-rosette`, `.link-card`, and `body::before`.
- Produces: a regression contract for the fixed backdrop, cover/banner overlap, generated badge, and enlarged mobile cards.

- [ ] **Step 1: Add the failing cover-overlap and badge assertions**

Add to the existing global-backdrop test:

```ts
const overlap = await page.locator('.profile-hero').evaluate((hero) => {
  const banner = hero.querySelector('.profile-hero__banner')!.getBoundingClientRect();
  const portrait = hero.querySelector('.profile-hero__image')!.getBoundingClientRect();
  return portrait.top < banner.bottom && portrait.bottom > banner.top;
});

expect(overlap).toBe(true);
await expect(page.locator('img.verified-rosette')).toHaveAttribute(
  'src',
  '/images/julismo-verified-rosette-rounded.png',
);
await expect(page.locator('img.verified-rosette')).toHaveAttribute('alt', '');
```

- [ ] **Step 2: Run the focused test red**

Run: `npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"`

Expected: FAIL because the current banner has no in-flow size/overlap CSS and the current verification component is still an inline SVG.

### Task 2: Implement the cover hero, fixed illumination, larger scale, and generated badge

**Files:**
- Modify: `src/components/ProfileHero.astro`
- Modify: `src/components/VerifiedRosette.astro`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Create: `public/images/julismo-verified-rosette-rounded.png`
- Delete: `public/images/julismo-verified-rosette-v1.png`
- Delete: `public/images/julismo-verified-rosette.png`

**Interfaces:**
- Consumes: the already committed `public/images/julismo-hero-wave.png` and the supplied rounded badge PNG.
- Produces: a cover banner in normal document flow, a centred portrait overlapping the cover's lower boundary, an image-based badge, fixed background illumination, and a larger vertical-only mobile composition.

- [ ] **Step 1: Keep the existing banner markup as the first header child and make it an in-flow cover**

Use `.profile-hero__banner` as a full-bleed block with `height: clamp(178px, 49vw, 210px)`, `width: 100vw`, and `margin-left: calc(50% - 50vw)`. Its image fills the block with `object-fit: cover`; its overlay fades to `var(--color-bg)` at the bottom.

- [ ] **Step 2: Centre the portrait on the lower banner boundary**

Remove hero top padding. Give `.profile-hero__image` `margin-top: -47px`, `position: relative`, and `z-index: 1` so its 94 px circular image overlaps the cover. Keep name and bio beneath it and lower all cards through the additional cover height.

- [ ] **Step 3: Replace the verification SVG with this decorative image**

Replace the component body with:

```astro
<img
  class="verified-rosette"
  src="/images/julismo-verified-rosette-rounded.png"
  alt=""
  aria-hidden="true"
  width="624"
  height="628"
  decoding="async"
/>
```

Style it at 21 px by 21 px with `object-fit: contain`, `flex: 0 0 21px`, and no overflow clipping.

- [ ] **Step 4: Implement the fixed background and large mobile scale**

Set `body` to solid `var(--color-bg)`. Use fixed `body::before` with `inset: 0`, `z-index: 0`, `pointer-events: none`, and the existing radial gradient. Move the small animated ambient glow to `body::after`. Keep `.page-shell` at `z-index: 1`, set `--content-width: 390px`, shell width to `min(calc(100% - 24px), var(--content-width))`, card height to 66 px, photo size to 94 px, heading to `clamp(1.45rem, 5vw, 1.62rem)`, bio to `0.86rem`, icons to 38 px, card title to `0.9rem`, description to `0.74rem`, and arrow to `1.18rem`.

- [ ] **Step 5: Add thin black-and-silver vertical scrollbar styling only**

Style `scrollbar-color`, `scrollbar-width`, and WebKit scrollbar width/thumb/track. Do not alter `overflow-x: clip`.

- [ ] **Step 6: Run the focused test green, then the whole browser spec**

Run: `npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"`

Expected: PASS for all projects.

Then run: `npx playwright test tests/e2e/profile.spec.ts`

Expected: all applicable tests pass, with only the intentional no-JS reduced-motion skip.

### Task 3: Create and test the rounded QR renderer

**Files:**
- Create: `scripts/rounded-qr.mjs`
- Create: `tests/unit/rounded-qr.test.js`
- Modify: `scripts/generate-qr.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `public/qr/julismo.svg`
- Modify: `public/qr/julismo-card.svg`
- Modify: `public/qr/julismo.png`

**Interfaces:**
- Consumes: the QR matrix returned by `QRCode.create(target.href, { errorCorrectionLevel: 'H' })`.
- Produces: `renderRoundedQrSvg(matrix, { margin, dark, light })` and `renderRoundedQrPng(matrix, { margin, modulePixels, dark, light })`, then the three regenerated assets.

- [ ] **Step 1: Add a failing renderer test before production code**

Write a Vitest test that creates a matrix for `https://julismo.vercel.app/`, calls the future SVG renderer, and expects a 4-module margin, rounded module `rx` geometry, three labelled rounded finder structures, and no `shape-rendering="crispEdges"` output. Add a PNG assertion that the renderer returns a non-empty Buffer.

- [ ] **Step 2: Run the unit test red**

Run: `npx vitest run tests/unit/rounded-qr.test.js`

Expected: FAIL because `scripts/rounded-qr.mjs` does not yet exist.

- [ ] **Step 3: Add only the pure renderer required by the test**

Use `qrcode` only for the standards-compliant matrix. Add `pngjs` version `^5.0.0` as an explicit dev dependency for pure-JavaScript raster output. Render each ordinary dark module with small rounded corners; skip each 7-by-7 finder area and replace it with a high-contrast nested rounded outer dark square, white inner square, and dark centre square. Preserve the 4-module white quiet zone.

- [ ] **Step 4: Change the generator to consume the rounded renderer**

Create the H-level matrix once. Use the renderer for `julismo.svg` and the nested reading SVG inside `julismo-card.svg`; use the renderer Buffer for `julismo.png`. Keep the card art outside the QR reading region only.

- [ ] **Step 5: Run unit test green and regenerate**

Run: `npx vitest run tests/unit/rounded-qr.test.js && npm run generate:qr`

Expected: the renderer unit test passes and all three local QR assets are updated for the unchanged Julismo URL.

- [ ] **Step 6: Decode all generated outputs before release**

Use OpenCV to decode `public/qr/julismo.png`, rasterize/decode `public/qr/julismo.svg`, and rasterize/decode `public/qr/julismo-card.svg`. All three must return exactly `https://julismo.vercel.app/`.

### Task 4: Full verification, review, integration, and publication

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-07-global-backdrop-and-hero-banner-design.md`

- [ ] **Step 1: Update README QR wording**

Document that the QR uses static locally generated rounded modules, a protected quiet zone, and must be regenerated only when the target URL changes.

- [ ] **Step 2: Run full checks**

Run: `npm test && npm run build`

Expected: Astro reports zero diagnostics, Vitest passes, Playwright passes all applicable tests, and the static build succeeds.

- [ ] **Step 3: Inspect at 390 by 844 with managed Playwright**

Capture a fresh screenshot before and after a vertical scroll. Confirm the fixed illumination stays visible, the cover and portrait overlap look intentional, card size is legible, badge is uncropped, and no horizontal scrollbar exists.

- [ ] **Step 4: Commit the focused branch, request a whole-branch review, integrate reviewed work into `development` then `main`, push both, and deploy `main` to the personal Vercel project.**

Expected: production `https://julismo.vercel.app/` shows the reviewed visual refinement and its three hosted QR assets decode to the exact production URL.
