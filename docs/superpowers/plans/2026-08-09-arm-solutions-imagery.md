# ARM Solutions Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Generate, optimise and integrate three compact monochrome visual thumbnails into the ARM Solutions disclosure without weakening conversion, mobile readability or accessibility.

**Architecture:** Three curated generated bitmaps are delivered as local 256px WebPs under public/images/arm-solutions. armSolutions owns their stable paths; SolutionDisclosure.astro renders decorative image markup; scoped CSS adds the common graphite treatment and responsive two-column layout. Existing native disclosure, link order, motion and business copy stay unchanged.

**Tech Stack:** Astro 7, TypeScript, Vitest, Playwright, built-in image generation, FFmpeg already installed on the workstation.

## Global Constraints

- Work only in C:\dev\julismo\.worktrees\feat-arm-solutions-disclosure on feat/arm-solutions-disclosure; do not modify main.
- Create exactly three final local assets: quotes.webp, documents.webp and operations.webp under public/images/arm-solutions.
- Each final WebP is 256 by 256 pixels and at most 45 KB; together they are at most 135 KB.
- No new package, CMS, remote image service, JavaScript interaction, per-solution route, video, carousel, WebGL, auto-scroll or image animation.
- Images are abstract editorial operations still lifes in black, matte graphite and brushed platinum; no people, faces, trucks, warehouses, logos, brands, readable text, invented UI, neon, robots or fake dashboards.
- Image treatment is local CSS: grayscale, reduced brightness/contrast and a graphite-to-black overlay. Do not bake page-colour treatment into only one asset.
- ARM stays native details/summary; its secure inner ARM link, keyboard order, gyro handling and reduced-motion behaviour stay intact.
- Decorative image markup uses empty alt and aria-hidden="true"; live HTML copy remains the accessible information.
- Spacing values are binding: summary-to-panel 12px; default item gap 10px; default item padding and text/image gap 12px; image side clamp(58px, 20vw, 72px); item min height 92px; at widths below 320px use item gap 8px, padding/text-image gap 10px and item min height 88px; list-to-site-link 12px.
- The ARM site link has a minimum 44px touch height. SOLUÇÕES remains left-aligned with the main ARM text.
- ARM open and closed must not overflow at 280, 320, 390, 768 and 1440px. Capture 390 by 844 and 1440 by 900 visual evidence in both states.

---

## File Structure

| File | Responsibility |
| --- | --- |
| public/images/arm-solutions/quotes.webp | Decorative visual for quotation speed. |
| public/images/arm-solutions/documents.webp | Decorative visual for document hand-off. |
| public/images/arm-solutions/operations.webp | Decorative visual for operational control. |
| src/data/profile.ts | Stable path for each solution visual. |
| src/components/SolutionDisclosure.astro | Decorative image markup for each existing solution item. |
| src/styles/global.css | Scoped thumbnail treatment, spacing and responsive layout. |
| tests/unit/profile.test.ts | Data path and local asset budget contract. |
| tests/e2e/profile.spec.ts | Browser contract for decorative images, geometry, gaps and touch target. |

## Task 1: Generate and curate the three local visual assets

**Files:**

- Create: public/images/arm-solutions/quotes.webp
- Create: public/images/arm-solutions/documents.webp
- Create: public/images/arm-solutions/operations.webp

**Interfaces:**

- Consumes: docs/superpowers/specs/2026-08-09-arm-solutions-imagery-design.md.
- Produces: three 256px square WebP files named exactly for later armSolutions.image paths.

- [ ] **Step 1: Generate one square candidate for each approved operational concept.**

Use the built-in image generator once per prompt. Do not place words inside the image.

~~~
Use case: stylized-concept
Asset type: compact decorative thumbnail for the Julismo ARM Solutions mobile profile
Primary request: an abstract editorial still life that communicates quotation speed and protected margins: two overlapping matte graphite document planes, restrained brushed-platinum measurement lines, and one subtle timing/precision motif
Scene/backdrop: seamless deep-black studio field
Style/medium: premium product-editorial photography, plausible materials, minimalist composition
Composition/framing: square, central motif, 18% clean crop-safe margin on every edge
Lighting/mood: low-key graphite studio light with one soft platinum rim
Color palette: black, charcoal, graphite, brushed silver only
Text (verbatim): ""
Constraints: no readable writing, no numbers, no logos, no brands, no people, no trucks, no warehouse, no robot, no neon, no dashboard UI, no watermark
~~~

~~~
Use case: stylized-concept
Asset type: compact decorative thumbnail for the Julismo ARM Solutions mobile profile
Primary request: an abstract editorial still life that communicates documents ready for invoicing: ordered matte graphite document sheets connected by one thin brushed-platinum route, with a calm clean hand-off rhythm
Scene/backdrop: seamless deep-black studio field
Style/medium: premium product-editorial photography, plausible paper and metal materials, minimalist composition
Composition/framing: square, central motif, 18% clean crop-safe margin on every edge
Lighting/mood: low-key graphite studio light with one soft platinum rim
Color palette: black, charcoal, graphite, brushed silver only
Text (verbatim): ""
Constraints: no readable writing, no numbers, no labels, no logos, no brands, no people, no trucks, no warehouse, no robot, no neon, no dashboard UI, no watermark
~~~

~~~
Use case: stylized-concept
Asset type: compact decorative thumbnail for the Julismo ARM Solutions mobile profile
Primary request: an abstract editorial still life that communicates operational control: a balanced dark network of four restrained brushed-platinum nodes connected by thin routes across a matte graphite surface, organised and calm rather than futuristic
Scene/backdrop: seamless deep-black studio field
Style/medium: premium product-editorial photography, plausible graphite and metal materials, minimalist composition
Composition/framing: square, central motif, 18% clean crop-safe margin on every edge
Lighting/mood: low-key graphite studio light with one soft platinum rim
Color palette: black, charcoal, graphite, brushed silver only
Text (verbatim): ""
Constraints: no readable writing, no numbers, no logos, no brands, no people, no trucks, no warehouse, no robot, no neon, no dashboard UI, no watermark
~~~

- [ ] **Step 2: Inspect candidates and reject any visually inconsistent output.**

Open each generated bitmap with view_image. Accept only an image where the primary motif is readable at 72px, edges are crop-safe, no false text appears, and all three feel like one collection. Regenerate only the failing concept with the same prompt plus one targeted correction.

- [ ] **Step 3: Deliver exact local WebPs.**

Copy the three accepted generated source files into the ignored work-artifact folder as exactly `.superpowers/arm-imagery-sources/quotes-source.png`, `.superpowers/arm-imagery-sources/documents-source.png` and `.superpowers/arm-imagery-sources/operations-source.png`. Then run the exact FFmpeg commands below. The scale/crop chain guarantees final dimensions instead of relying on the generator output size.

~~~powershell
New-Item -ItemType Directory -Force .superpowers/arm-imagery-sources | Out-Null
New-Item -ItemType Directory -Force public/images/arm-solutions | Out-Null
ffmpeg -y -i .superpowers/arm-imagery-sources/quotes-source.png -vf "scale=256:256:force_original_aspect_ratio=increase,crop=256:256" -c:v libwebp -quality 78 -compression_level 6 public/images/arm-solutions/quotes.webp
ffmpeg -y -i .superpowers/arm-imagery-sources/documents-source.png -vf "scale=256:256:force_original_aspect_ratio=increase,crop=256:256" -c:v libwebp -quality 78 -compression_level 6 public/images/arm-solutions/documents.webp
ffmpeg -y -i .superpowers/arm-imagery-sources/operations-source.png -vf "scale=256:256:force_original_aspect_ratio=increase,crop=256:256" -c:v libwebp -quality 78 -compression_level 6 public/images/arm-solutions/operations.webp
~~~

- [ ] **Step 4: Verify dimensions, byte budget and visual integrity.**

~~~powershell
Get-ChildItem public/images/arm-solutions/*.webp | Select-Object Name,Length
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 public/images/arm-solutions/quotes.webp
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 public/images/arm-solutions/documents.webp
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 public/images/arm-solutions/operations.webp
~~~

Expected: every probe prints 256,256; each file is at most 46080 bytes; combined length is at most 138240 bytes. Inspect all three final WebPs with view_image after conversion.

- [ ] **Step 5: Commit the curated assets.**

~~~powershell
git add public/images/arm-solutions/quotes.webp public/images/arm-solutions/documents.webp public/images/arm-solutions/operations.webp
git commit -m "feat: add ARM solution visual assets"
~~~

## Task 2: Publish the asset contract and decorative markup

**Files:**

- Modify: src/data/profile.ts
- Modify: src/components/SolutionDisclosure.astro
- Modify: tests/unit/profile.test.ts
- Modify: tests/e2e/profile.spec.ts

**Interfaces:**

- Consumes: the three WebPs committed in Task 1.
- Produces: armSolutions entries with an image path, and one img[data-solution-image] inside each existing li[data-solution-id].

- [ ] **Step 1: Write the failing asset-data unit contract.**

At the top of tests/unit/profile.test.ts, add:

~~~ts
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
~~~

Extend the existing ARM solution expectation with image values:

~~~ts
image: '/images/arm-solutions/quotes.webp'
image: '/images/arm-solutions/documents.webp'
image: '/images/arm-solutions/operations.webp'
~~~

Immediately after that expectation add:

~~~ts
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
  expect(sizes.every((size) => size <= 45 * 1024)).toBe(true);
  expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(135 * 1024);
});
~~~

- [ ] **Step 2: Write the failing browser markup contract.**

In reveals ARM entry solutions progressively and keeps its website available, after the three content assertions, add:

~~~ts
const visuals = disclosure.locator('[data-solution-image]');
await expect(visuals).toHaveCount(3);
const visualMetadata = await visuals.evaluateAll((images) => images.map((image) => ({
  src: image.getAttribute('src'),
  alt: image.getAttribute('alt'),
  ariaHidden: image.getAttribute('aria-hidden'),
  width: image.getAttribute('width'),
  height: image.getAttribute('height'),
  loading: image.getAttribute('loading'),
  decoding: image.getAttribute('decoding'),
})));
expect(visualMetadata).toEqual(
  [
    { src: '/images/arm-solutions/quotes.webp', alt: '', ariaHidden: 'true', width: '256', height: '256', loading: 'lazy', decoding: 'async' },
    { src: '/images/arm-solutions/documents.webp', alt: '', ariaHidden: 'true', width: '256', height: '256', loading: 'lazy', decoding: 'async' },
    { src: '/images/arm-solutions/operations.webp', alt: '', ariaHidden: 'true', width: '256', height: '256', loading: 'lazy', decoding: 'async' },
  ],
);
~~~

- [ ] **Step 3: Run the two contracts to prove RED.**

~~~powershell
npm run test:unit
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions" --reporter=list
~~~

Expected: the unit test fails because image is absent from solution data; focused E2E fails because data-solution-image is absent.

- [ ] **Step 4: Add stable data paths and semantic image markup.**

Make armSolutions exactly:

~~~ts
export const armSolutions = [
  {
    id: 'quotes',
    title: 'Orçamentos que chegam a tempo',
    description: 'Respostas rápidas, com margem protegida.',
    image: '/images/arm-solutions/quotes.webp',
  },
  {
    id: 'documents',
    title: 'Documentos prontos a faturar',
    description: 'Guias, CMR e POD organizados antes de bloquearem faturação.',
    image: '/images/arm-solutions/documents.webp',
  },
  {
    id: 'operations',
    title: 'Operação sob controlo',
    description: 'Prioridades, atrasos e pendências visíveis antes de virarem problemas.',
    image: '/images/arm-solutions/operations.webp',
  },
] as const;
~~~

In each existing solution li, keep text and append:

~~~astro
<span class="solution-disclosure__visual" aria-hidden="true">
  <img
    class="solution-disclosure__image"
    data-solution-image
    src={solution.image}
    alt=""
    aria-hidden="true"
    width="256"
    height="256"
    loading="lazy"
    decoding="async"
  />
</span>
~~~

- [ ] **Step 5: Run the contracts to prove GREEN.**

~~~powershell
npm run test:unit
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions" --reporter=list
npm run check
~~~

Expected: all unit tests pass, focused E2E passes, Astro reports zero diagnostics.

- [ ] **Step 6: Commit data and markup.**

~~~powershell
git add src/data/profile.ts src/components/SolutionDisclosure.astro tests/unit/profile.test.ts tests/e2e/profile.spec.ts
git commit -m "feat: render ARM solution visuals"
~~~

## Task 3: Apply responsive treatment, spacing and visual regression coverage

**Files:**

- Modify: src/styles/global.css
- Modify: tests/e2e/profile.spec.ts

**Interfaces:**

- Consumes: img[data-solution-image] from Task 2 and existing data-solution-id, data-arm-site, native disclosure and width-matrix tests.
- Produces: square visual tiles, documented spacing at normal/narrow widths, a 44px ARM site target, no overflow, and screenshot evidence.

- [ ] **Step 1: Write the failing responsive geometry and spacing contract.**

Add this test after the existing expanded-width test:

~~~ts
test('keeps ARM visual tiles spaced and contained at every supported width', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The image spacing matrix runs once from the desktop project.');

  const expectedTileWidths = new Map([
    [280, 58],
    [320, 64],
    [390, 72],
    [768, 72],
    [1440, 72],
  ]);

  for (const [width, expectedTileWidth] of expectedTileWidths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
    await disclosure.locator('summary[data-arm-summary]').click();
    await expect(disclosure).toHaveAttribute('open', '');

    const layout = await disclosure.evaluate((element) => {
      const summary = element.querySelector<HTMLElement>('summary[data-arm-summary]')!;
      const panel = element.querySelector<HTMLElement>('.solution-disclosure__panel')!;
      const list = element.querySelector<HTMLElement>('.solution-disclosure__list')!;
      const site = element.querySelector<HTMLElement>('[data-arm-site]')!;
      const items = Array.from(element.querySelectorAll<HTMLElement>('[data-solution-id]'));
      const image = items[0].querySelector<HTMLElement>('[data-solution-image]')!;
      const itemStyle = getComputedStyle(items[0]);
      const listStyle = getComputedStyle(list);
      const panelStyle = getComputedStyle(panel);
      const summaryBox = summary.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      const itemBoxes = items.map((item) => item.getBoundingClientRect());

      return {
        imageWidth: image.getBoundingClientRect().width,
        itemMinHeight: Number.parseFloat(itemStyle.minHeight),
        itemPadding: Number.parseFloat(itemStyle.paddingTop),
        itemColumnGap: Number.parseFloat(itemStyle.columnGap),
        listGap: Number.parseFloat(listStyle.rowGap),
        panelGap: Number.parseFloat(panelStyle.rowGap),
        siteHeight: site.getBoundingClientRect().height,
        summaryToPanel: panelBox.top - summaryBox.bottom,
        itemGaps: itemBoxes.slice(1).map((box, index) => box.top - itemBoxes[index].bottom),
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    const narrow = width < 320;
    expect(layout.imageWidth, String(width) + 'px tile').toBeCloseTo(expectedTileWidth, 0);
    expect(layout.itemMinHeight, String(width) + 'px minimum height').toBe(narrow ? 88 : 92);
    expect(layout.itemPadding, String(width) + 'px padding').toBe(narrow ? 10 : 12);
    expect(layout.itemColumnGap, String(width) + 'px text gap').toBe(narrow ? 10 : 12);
    expect(layout.listGap, String(width) + 'px list gap').toBe(narrow ? 8 : 10);
    expect(layout.panelGap, String(width) + 'px panel gap').toBe(12);
    expect(layout.summaryToPanel, String(width) + 'px summary separation').toBeCloseTo(12, 0);
    expect(layout.itemGaps, String(width) + 'px item separation').toEqual(Array(2).fill(narrow ? 8 : 10));
    expect(layout.siteHeight, String(width) + 'px ARM target').toBeGreaterThanOrEqual(44);
    expect(layout.scrollWidth, String(width) + 'px overflow').toBeLessThanOrEqual(layout.viewportWidth);
  }
});
~~~

- [ ] **Step 2: Run the geometry contract to prove RED.**

~~~powershell
npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "keeps ARM visual tiles spaced" --reporter=list
~~~

Expected: failure because visual tiles and binding spacing values do not exist.

- [ ] **Step 3: Add scoped CSS using the approved values.**

Replace the existing disclosure panel/list/item/site-link rules with:

~~~css
.solution-disclosure {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.solution-disclosure__panel {
  display: grid;
  min-width: 0;
  gap: 12px;
  padding: 0 4px 4px;
}

.solution-disclosure__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.solution-disclosure__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(58px, 20vw, 72px);
  align-items: center;
  min-width: 0;
  min-height: 92px;
  column-gap: 12px;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 12px;
  background: rgb(255 255 255 / 2.5%);
  color: var(--color-text);
  padding: 12px;
}

.solution-disclosure__item > strong,
.solution-disclosure__item > span:not(.solution-disclosure__visual) {
  grid-column: 1;
  min-width: 0;
}

.solution-disclosure__visual {
  grid-column: 2;
  grid-row: 1 / span 2;
  position: relative;
  align-self: center;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 10px;
  background: linear-gradient(145deg, #37373f, #111114 66%);
  box-shadow: inset 0 1px rgb(255 255 255 / 8%);
}

.solution-disclosure__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) brightness(0.74) contrast(0.92);
}

.solution-disclosure__visual::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgb(48 48 56 / 48%), rgb(5 5 8 / 78%));
  content: '';
  pointer-events: none;
}

.solution-disclosure__site-link {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  min-height: 44px;
  color: #d8d8dd;
  font-size: 0.74rem;
  font-weight: 650;
  padding: 0 8px;
  text-underline-offset: 0.16em;
}

@media (max-width: 319px) {
  .solution-disclosure__list {
    gap: 8px;
  }

  .solution-disclosure__item {
    min-height: 88px;
    column-gap: 10px;
    padding: 10px;
  }
}
~~~

Keep the existing solution title/description type rules, the chevron rules and the reduced-motion rule. Do not change link-section-label; its current justify-self start and left inset preserve the approved alignment.

- [ ] **Step 4: Run focused geometry and browser visual checks to prove GREEN.**

~~~powershell
npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "keeps ARM visual tiles spaced" --reporter=list
~~~

Capture four files under ignored output/playwright:

~~~
arm-imagery-390-closed.png
arm-imagery-390-open.png
arm-imagery-1440-closed.png
arm-imagery-1440-open.png
~~~

Accept only if the closed state is unchanged, text remains dominant, thumbnail treatment is visibly coherent, SOLUÇÕES stays left-aligned, all three mini-cards breathe independently and GitHub retains the desktop black breathing room.

- [ ] **Step 5: Run the full gate.**

~~~powershell
npm test
npm run build
git diff --check
~~~

Expected: Astro zero diagnostics, all Vitest and Playwright tests pass with only intentional skips, build succeeds, and diff check is clean.

- [ ] **Step 6: Commit the presentation layer.**

~~~powershell
git add src/styles/global.css tests/e2e/profile.spec.ts
git commit -m "feat: style ARM solution imagery"
git status --short
~~~

## Plan Self-Review

- **Spec coverage:** Task 1 covers image generation, visual curation, 256px WebP format and byte budget. Task 2 covers local data ownership, decorative semantics and asset tests. Task 3 covers the exact spacing table, CSS overlay treatment, 44px ARM link target, all five supported widths, screenshots and full verification.
- **Placeholder scan:** No incomplete runtime placeholders remain. Task 1 defines the exact ignored source-file paths created after generation, as well as final output names, dimensions, quality settings, CSS values, selectors, tests and commands.
- **Type consistency:** armSolutions.image is introduced in Task 2 and consumed as solution.image in the same component; data-solution-image is produced in Task 2 and consumed by Task 3 browser tests.
- **Scope:** The plan does not alter unrelated hero, banner, contact links, profile copy, deployment or main branch state.
