# ARM Solutions Documentary Banners Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the abstract ARM artwork with three performant documentary banners and make the expanded ARM carousel readable, keyboard-correct and visually consistent on mobile and desktop.

**Architecture:** The existing native ARM `<details>` remains the progressive-disclosure boundary. `armSolutions` supplies the three local asset paths and concise chip copy; `SolutionDisclosure.astro` owns selection state and lazy hydration; CSS supplies the 21:9 crop, dark copy veil and reduced-motion treatment. Image sources live only in the ignored `.superpowers/arm-banner-sources/` directory; the shipped WebPs live in `public/images/arm-solutions/`.

**Tech Stack:** Astro 7, TypeScript, native `<details>`, browser JavaScript, CSS, Vitest, Playwright, Sharp, ImageGen.

## Global Constraints

- Use the approved design in `docs/superpowers/specs/2026-08-09-arm-solutions-documentary-banners-design.md` as the source of truth.
- Ship exactly three local WebP banners at 1176 × 504 px: `quotes.webp`, `documents.webp`, `operations.webp`.
- Keep each final banner at or below 100 KB and all three at or below 300 KB.
- No visible text, logos, client data, branded uniforms/vehicles, watermarks or legible screens in the images.
- Preserve the approved Portuguese (Portugal) copy, ARM URL, contact order and native closed-by-default disclosure.
- Banners remain decorative (`alt=""`, `aria-hidden="true"`) and the content text stays in HTML.
- Do not stage or modify unrelated Claude outputs such as `public/og.png` or `scripts/generate-og-image.mjs`.
- Do not push, create a pull request or merge to `main` without an explicit user instruction after validation.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `scripts/generate-arm-banners.mjs` | Converts the three ignored ImageGen source PNGs into deterministic, optimised public WebPs. |
| `package.json` / `package-lock.json` | Declares the supported Sharp development dependency and exposes `npm run generate:banners`. |
| `public/images/arm-solutions/*.webp` | Final documentary banners served by the profile. |
| `src/components/SolutionDisclosure.astro` | Keeps the native disclosure, safe lazy image hydration and accessible manual carousel selection. |
| `src/styles/global.css` | Renders the responsive visual treatment without overflow or unwanted motion. |
| `tests/unit/profile.test.ts` | Guards local banner paths, byte budget and lossily encoded WebP dimensions. |
| `tests/e2e/profile.spec.ts` | Guards panel/tab relationships, manual selection, keyboard use, crop bounds and mobile overflow. |

### Task 1: Create and optimise the documentary banner set

**Files:**
- Create: `.superpowers/arm-banner-sources/{quotes,documents,operations}.png` (ignored local sources; never stage)
- Modify: `scripts/generate-arm-banners.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `public/images/arm-solutions/{quotes,documents,operations}.webp`
- Modify: `tests/unit/profile.test.ts:1-102`

**Interfaces:**
- Consumes: `<repo>/.superpowers/arm-banner-sources/{quotes,documents,operations}.png`.
- Produces: three 1176 × 504 WebPs addressed by existing `armSolutions[*].image` values.
- Command: `npm run generate:banners` writes the public assets and rejects missing sources or budget excess.

- [ ] **Step 1: Write the failing asset contract**

  Extend the unit test imports and add a small lossily encoded WebP reader. The existing vector-like `operations.webp` is below the 12 KB floor, so the test must fail before the new photographic assets are generated.

  ```ts
  import { existsSync, readFileSync, statSync } from 'node:fs';

  function readVp8WebpSize(path: string) {
    const bytes = readFileSync(path);
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
    expect(bytes.subarray(12, 16).toString('ascii')).toBe('VP8 ');
    expect(bytes.subarray(23, 26).toString('hex')).toBe('9d012a');
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }
  ```

  Replace the current budget assertions with:

  ```ts
  expect(sizes.every((size) => size >= 12 * 1024 && size <= 100 * 1024)).toBe(true);
  expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(300 * 1024);
  expect(assets.map(readVp8WebpSize)).toEqual([
    { width: 1176, height: 504 },
    { width: 1176, height: 504 },
    { width: 1176, height: 504 },
  ]);
  ```

- [ ] **Step 2: Run the focused unit test to verify it fails**

  Run: `npx vitest run tests/unit/profile.test.ts`

  Expected: FAIL in `keeps ARM visual assets local and within the mobile budget`, because at least the current abstract `operations.webp` is below 12 KB.

- [ ] **Step 3: Generate one source image per approved scene with ImageGen**

  Create the three PNGs in the ignored source directory. Use this common suffix in all prompts:

  ```text
  Wide 21:9 editorial documentary photograph for a premium dark personal profile. European B2B logistics setting; charcoal, steel blue and restrained natural warm light; calm, dark lower-left third reserved for HTML overlay; point of interest centre-right; no readable text, logos, watermarks, branded uniforms, licence plates, dashboards, UI, posed stock-photo smile, neon or illustration.
  ```

  Use these scene-specific prompts:

  ```text
  quotes: A logistics operations coordinator viewed three-quarter profile, quietly preparing a commercial quotation at a real desk; a loading area or transport operation softly out of focus behind them; monitor present but unreadable; focused, candid, non-posed action.

  documents: Close documentary crop of real hands sorting delivery notes, CMR and proof-of-delivery papers beside a neutral laptop or tablet; credible paper texture but no readable marks; the action conveys careful validation before invoicing, not a generic office flat lay.

  operations: Two or three logistics colleagues naturally coordinating an outbound dispatch in a warehouse, dock or operations room; focused conversation and practical gestures, subtly blurred boxes or vehicles without marks; no handshake, presentation pose or generic boardroom.
  ```

- [ ] **Step 4: Replace the procedural illustration generator with a reproducible photo optimiser**

  Add `sharp` as a direct development dependency (`npm install --save-dev sharp`) and change `scripts/generate-arm-banners.mjs` so it reads the three ignored PNGs, normalises their orientation, performs a deliberate 21:9 crop and writes only the final WebPs. Its setup and core loop must be:

  ```js
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const names = ['quotes', 'documents', 'operations'];
  const sourceDirectory = join(root, '.superpowers', 'arm-banner-sources');

  for (const name of names) {
    const source = join(sourceDirectory, `${name}.png`);
    const output = join(root, 'public', 'images', 'arm-solutions', `${name}.webp`);
    await access(source);
    await sharp(source)
      .rotate()
      .resize(1176, 504, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(output);
  }
  ```

  Keep explicit post-write byte-budget checks and fail with the file name and size if a limit is exceeded. Keep the existing `generate:banners` package script pointing at this file.

- [ ] **Step 5: Generate the final WebPs and run the focused contract**

  Run:

  ```powershell
  npm run generate:banners
  npm run test:unit
  ```

  Expected: 16+ unit tests pass; all three files are WebP, 1176 × 504, 12–100 KB individually and at most 300 KB combined.

- [ ] **Step 6: Inspect the three final sources before integration**

  Open each final WebP at full size and at the rendered 21:9 crop. Reject and regenerate any image with readable text, a logo, a posed team, a centre-cropped face, a busy lower-left third or AI artefacts in hands/documents.

- [ ] **Step 7: Commit only the asset pipeline and final banners**

  ```powershell
  git add package.json package-lock.json scripts/generate-arm-banners.mjs public/images/arm-solutions tests/unit/profile.test.ts
  git diff --cached --check
  git commit -m "feat: add documentary ARM solution banners"
  ```

### Task 2: Make carousel selection manual and semantically complete

**Files:**
- Modify: `src/components/SolutionDisclosure.astro:30-215`
- Modify: `src/data/profile.ts:5-32`
- Modify: `tests/e2e/profile.spec.ts:296-406`

**Interfaces:**
- Consumes: the three `armSolutions` objects, each with `id`, `label`, `hint`, `image`, `title`, `description`.
- Produces: `#solution-slide-{id}` tabpanels, `#solution-tab-{id}` dot tabs and `[data-solution-chip]` buttons with `aria-pressed` state.
- Behaviour: `selectSolution(index)` changes the active visual only after an explicit chip/tab interaction; it never creates an interval or auto-rotates.

- [ ] **Step 1: Write the failing E2E accessibility/interaction contract**

  Replace the broad dots/chips test with a test named `ARM carousel supports manual keyboard selection` and checks that require real panel IDs, complete tab wiring and no duplicate ambiguous state:

  ```ts
  const panel = (id: 'quotes' | 'documents' | 'operations') =>
    disclosure.locator(`#solution-slide-${id}`);
  const tab = (id: 'quotes' | 'documents' | 'operations') =>
    disclosure.locator(`#solution-tab-${id}`);
  const chip = (id: 'quotes' | 'documents' | 'operations') =>
    disclosure.locator(`[data-solution-chip-id="${id}"]`);

  await expect(panel('quotes')).toHaveAttribute('role', 'tabpanel');
  await expect(tab('quotes')).toHaveAttribute('aria-controls', 'solution-slide-quotes');
  await expect(chip('quotes')).toHaveAttribute('aria-pressed', 'true');

  await chip('operations').click();
  await expect(panel('operations')).toHaveAttribute('data-active', 'true');
  await expect(tab('operations')).toHaveAttribute('aria-selected', 'true');
  await expect(chip('operations')).toHaveAttribute('aria-pressed', 'true');
  ```

  Add a desktop-only `await page.waitForTimeout(8_300)` assertion that the explicitly selected `operations` slide remains active, proving no automatic rotation remains. Retain keyboard `Enter`, arrow, Home and End coverage for the actual tab controls.

- [ ] **Step 2: Run the focused E2E test to verify it fails**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "ARM carousel"`

  Expected: FAIL because the current articles have no `id` or `tabpanel` role, chips lack `aria-pressed`, and the current interval changes the selected slide after eight seconds.

- [ ] **Step 3: Implement manual, complete selection semantics**

  In the mapped article and dot controls, use the matching IDs and relationships:

  ```astro
  <article
    id={`solution-slide-${solution.id}`}
    class="solution-slide"
    role="tabpanel"
    aria-labelledby={`solution-tab-${solution.id}`}
    data-solution-id={solution.id}
    data-solution-slide={index}
    data-active={index === 0 ? 'true' : 'false'}
    aria-hidden={index === 0 ? 'false' : 'true'}
  >
  ```

  ```astro
  <button
    id={`solution-tab-${solution.id}`}
    type="button"
    class="solution-dots__dot"
    data-solution-dot={index}
    role="tab"
    aria-controls={`solution-slide-${solution.id}`}
    aria-selected={index === 0 ? 'true' : 'false'}
    aria-label={solution.title}
    tabindex={index === 0 ? 0 : -1}
  />
  ```

  The chips stay ordinary buttons and gain `aria-pressed={index === 0 ? 'true' : 'false'}`. In the script, remove `SLIDE_MS`, `timer`, `start`, `stop`, pointer/focus pause handlers and the reduced-motion listener. Keep a single `goTo(next)` that calls `paint()`, keep the existing keyboard tab navigation, and call `hydrateImages()` plus `goTo(0)` only on disclosure opening.

- [ ] **Step 4: Run focused E2E in mobile and desktop**

  Run:

  ```powershell
  npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "ARM carousel"
  npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "ARM carousel"
  ```

  Expected: PASS; one user action changes the active banner, tab state and chip state together, and it stays selected after 8.3 seconds.

- [ ] **Step 5: Commit the semantic interaction repair**

  ```powershell
  git add src/components/SolutionDisclosure.astro src/data/profile.ts tests/e2e/profile.spec.ts
  git diff --cached --check
  git commit -m "fix: make ARM carousel controls accessible"
  ```

### Task 3: Refine the responsive visual treatment and release evidence

**Files:**
- Modify: `src/styles/global.css:434-664`
- Modify: `tests/e2e/profile.spec.ts:408-460`
- Create: `output/playwright/arm-documentary-mobile.png` (ignored evidence)
- Create: `output/playwright/arm-documentary-desktop.png` (ignored evidence)

**Interfaces:**
- Consumes: `[data-solution-slide]`, `[data-solution-chip]`, `[data-solution-dot]` states from Task 2.
- Produces: a 21:9 `solution-carousel` with a lower copy veil, tactile chips and no overflow at supported widths.

- [ ] **Step 1: Add responsive geometry regression assertions**

  In the existing supported-width test, expand each slide and assert the carousel stays inside the disclosure and the rendered image has the intended ratio:

  ```ts
  const geometry = await disclosure.locator('[data-solution-carousel]').evaluate((carousel) => {
    const box = carousel.getBoundingClientRect();
    const image = carousel.querySelector<HTMLImageElement>('[data-solution-image]')!.getBoundingClientRect();
    return {
      carousel: { left: box.left, right: box.right, width: box.width, height: box.height },
      image: { width: image.width, height: image.height },
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.image.width / geometry.image.height).toBeGreaterThan(2.2);
  expect(geometry.image.width / geometry.image.height).toBeLessThan(2.45);
  ```

- [ ] **Step 2: Run the focused responsive geometry test**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "expanded ARM solutions contained"`

  Expected: PASS on the current 21:9 carousel baseline. This is a regression guard for the photo treatment, not a claim that an already-correct ratio should first fail.

- [ ] **Step 3: Apply the restrained photo treatment**

  Keep the disclosure as one expanding card. Preserve `aspect-ratio: 21 / 9`, `overflow: hidden`, the dark lower copy veil and `object-fit: cover`. Add exactly this restrained normalisation to the image rule so varied real photographs stay in the established dark profile system without becoming greyscale illustrations:

  ```css
  .solution-slide__image {
    filter: saturate(0.78) contrast(0.96) brightness(0.88);
  }
  ```

  Keep meaningful content out of the lower-left area in the images rather than darkening the entire photo. Preserve three chips at 390 px and use this compact fallback below 340 px so labels do not become miniature controls:

  ```css
  @media (max-width: 340px) {
    .solution-disclosure__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .solution-disclosure__list > li:last-child { grid-column: 1 / -1; }
  }
  ```

  Limit normal-motion transitions to opacity/transform; reduced motion sets durations and delays to zero.

- [ ] **Step 4: Capture and inspect actual browser evidence**

  With the local Astro server running, use Playwright CLI to open the ARM disclosure and save. Capture a fresh snapshot before every `click`; the ARM summary reference is intentionally obtained from that snapshot rather than hard-coded:

  ```powershell
  npx --yes --package @playwright/cli playwright-cli open http://127.0.0.1:4321/
  npx --yes --package @playwright/cli playwright-cli resize 390 844
  npx --yes --package @playwright/cli playwright-cli snapshot
  # Click the fresh ARM summary ref returned by the preceding snapshot.
  npx --yes --package @playwright/cli playwright-cli screenshot --filename output/playwright/arm-documentary-mobile.png
  npx --yes --package @playwright/cli playwright-cli resize 1440 900
  npx --yes --package @playwright/cli playwright-cli snapshot
  # Re-open the ARM disclosure with its fresh summary ref if navigation reset it.
  npx --yes --package @playwright/cli playwright-cli screenshot --filename output/playwright/arm-documentary-desktop.png
  ```

  Inspect both: no clipped copy, lower-left copy legible, people crop naturally, chips/tabs visibly selectable and no visual jump or horizontal scrollbar.

- [ ] **Step 5: Run the complete quality gate**

  Run:

  ```powershell
  npm run check
  npm run test:unit
  npm run test:e2e
  npm run build
  git diff --check
  ```

  Expected: Astro has zero diagnostics; all unit/E2E tests pass; build completes; diff check is clean. Allow the full 145-test E2E matrix more than two minutes rather than treating a harness timeout as a product failure.

- [ ] **Step 6: Commit only the responsive visual work**

  ```powershell
  git add src/styles/global.css tests/e2e/profile.spec.ts
  git diff --cached --check
  git commit -m "style: polish ARM documentary carousel"
  ```

- [ ] **Step 7: Reconcile the shared worktree before handoff**

  Run `git status --short` and stage only the approved ARM banner files. Leave unrelated untracked Claude outputs (`public/og.png`, `scripts/generate-og-image.mjs`) untouched. Report their presence to the user rather than deleting or committing them. Do not push or merge until the user has reviewed the Playwright evidence and expressly asks for release.
