# Diverse ARM Operations Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace only the ARM Operations banner with a credible, diverse logistics-team photograph that remains legible in the existing carousel.

**Architecture:** The public URL and carousel structure remain unchanged. A reviewed ImageGen PNG becomes the ignored local source `operations.png`; the existing Sharp generator produces the committed `operations.webp` at the established dimensions and size budget. No text, link, carousel, or interaction code changes are required.

**Tech Stack:** Built-in ImageGen, Sharp, Astro, Playwright, Vitest.

## Global Constraints

- Keep `documents.webp` untouched because it is already rejected.
- The final Operations scene contains one visibly Black/African, one visibly East Asian, and one visibly European professional, collaborating as peers.
- Keep the group centre/right and preserve a dark, uncluttered lower-left text-safe area.
- No logo, readable text, watermark, branded uniform, fake UI, malformed anatomy, duplicated person, or staged corporate pose.
- The committed `public/images/arm-solutions/operations.webp` remains 1176×504 WebP and between 12 KB and 100 KB; all three ARM images remain at or below 300 KB combined.
- Preserve the existing `operations.webp` public path and all PT-PT copy.

---

### Task 1: Generate and accept a diverse Operations source

**Files:**
- Create (ignored): `.superpowers/arm-banner-sources/operations-diverse.png`
- Modify (ignored, only after acceptance): `.superpowers/arm-banner-sources/operations.png`
- Inspect: `public/images/arm-solutions/operations.webp`

**Interfaces:**
- Consumes: `scripts/generate-arm-banners.mjs`, which reads `.superpowers/arm-banner-sources/operations.png`.
- Produces: a reviewed PNG source at that exact path for the existing renderer.

- [ ] **Step 1: Record the current asset as the rollback point**

Run:

```powershell
Get-FileHash public/images/arm-solutions/operations.webp -Algorithm SHA256
Copy-Item .superpowers/arm-banner-sources/operations.png .superpowers/arm-banner-sources/operations-before-diversity.png
```

Expected: a SHA-256 value is printed and the ignored rollback source is available.

- [ ] **Step 2: Generate one non-destructive ImageGen candidate**

Use the built-in ImageGen tool with this production brief:

```text
Use case: photorealistic-natural
Asset type: 21:9 website carousel banner for a logistics operations solution
Primary request: candid documentary photograph of three logistics professionals collaboratively reviewing a tablet and a dispatch plan on a warehouse floor.
Subject: one Black/African professional, one East Asian professional, and one European professional; all three are peers actively contributing to the same operational decision.
Scene/backdrop: real distribution warehouse, muted boxes and loading-bay context, no identifiable company.
Composition/framing: team in the centre and right half; maintain a dark, uncluttered lower-left 40 percent for HTML overlay copy; no one cropped at a joint or face.
Lighting/mood: moody editorial warehouse light, charcoal and muted midnight-blue palette, credible rather than glossy stock photography.
Constraints: natural faces, hands and tablet; no visible text, logos, uniforms, watermarks, UI screens, stereotypes, duplicate people, posed meeting, or props that dominate the scene.
```

Save the generated PNG as `.superpowers/arm-banner-sources/operations-diverse.png`; do not overwrite `operations.png` yet.

- [ ] **Step 3: Inspect the candidate before adoption**

Open the candidate at full size and inspect the faces, hands, tablet edges, background, and the lower-left text-safe region. Reject it if any person has malformed anatomy, ethnicity is ambiguous at banner scale, the scene looks staged, or the left overlay area is not dark enough.

Run:

```powershell
node -e "const sharp=require('sharp'); sharp('.superpowers/arm-banner-sources/operations-diverse.png').metadata().then(console.log)"
```

Expected: a readable raster source with no required in-image text.

- [ ] **Step 4: Promote only the accepted candidate**

Run:

```powershell
Copy-Item .superpowers/arm-banner-sources/operations-diverse.png .superpowers/arm-banner-sources/operations.png -Force
npm run generate:banners
```

Expected: `operations.webp` is regenerated and the generator prints one line for each ARM image plus a total at or below 307,200 bytes.

### Task 2: Validate the generated public asset and page contracts

**Files:**
- Modify: `public/images/arm-solutions/operations.webp`
- Test: `tests/unit/profile.test.ts`
- Test: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: the accepted `operations.png` source and the unchanged `/images/arm-solutions/operations.webp` URL in `src/data/profile.ts`.
- Produces: a public WebP that preserves the existing carousel data contract.

- [ ] **Step 1: Run the existing asset contract before staging**

Run:

```powershell
npm run test:unit
```

Expected: `keeps ARM visual assets local and within the mobile budget` passes, including all three 1176×504 WebP assets.

- [ ] **Step 2: Exercise the Operations choice in the browser contract**

Run:

```powershell
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "ARM carousel supports manual keyboard selection"
```

Expected: one passing scenario; choosing Operations changes the active slide while keyboard tab semantics remain intact.

- [ ] **Step 3: Capture and inspect the final banner in the actual mobile card**

Use a local Playwright browser session at `http://127.0.0.1:4321/`: open ARM Solutions, select the Operations chip, remove the Astro dev toolbar only from the test browser, and save `output/playwright/operations-diverse-mobile.png`.

Expected: the three people are clearly distinguishable, the title `Operação sob controlo` is readable at 390 px, and no part of the carousel or chips overflows.

- [ ] **Step 4: Commit only the approved public asset**

```powershell
git add public/images/arm-solutions/operations.webp
git diff --cached --check
git commit -m "feat: diversify ARM operations banner"
```

Expected: exactly one binary public-asset path is committed; ignored source PNGs and unrelated working-tree changes are not staged.

### Task 3: Run the release-quality gate

**Files:**
- Verify: `public/images/arm-solutions/operations.webp`
- Verify: `src/components/SolutionDisclosure.astro`
- Verify: `src/styles/global.css`

**Interfaces:**
- Consumes: the committed public banner and the established carousel.
- Produces: evidence that the content refresh did not regress page behaviour.

- [ ] **Step 1: Run the complete quality suite**

Run:

```powershell
npm test
npm run build
git diff --check
```

Expected: Astro reports 0 diagnostics, Vitest and all non-skipped Playwright scenarios pass, the static build exits 0, and `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Report the visual and technical result**

Report the final public path, the new Operations banner rationale, the exact test/build result, and that Documents remains unchanged and rejected.
