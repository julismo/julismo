# Global Backdrop and Hero Banner Implementation Plan

> **Status:** Superseded by the in-flow cover-banner plan in `2026-08-07-hero-qr-refinement-v2.md`. Retained as the initial approved planning record.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a continuous illuminated backdrop and supplied silver-wave hero banner while increasing the mobile profile scale without horizontal scrolling.

**Architecture:** `body::before` becomes the fixed radial background layer. `ProfileHero` receives a decorative banner wrapper behind its existing portrait and text. CSS scales existing primitives; profile data, links, JavaScript, and dependencies remain unchanged.

**Tech Stack:** Astro 5, CSS, Playwright, Vitest.

## Global Constraints

- Preserve the existing copy, five destinations, card order, icon set, black/silver palette, orientation effect, and reduced-motion behaviour.
- Copy `C:\Users\julis\Downloads\Gemini_Generated_Image_ov91cpov91cpov91__2___1_-removebg-preview (1).png` unchanged to `public/images/julismo-hero-wave.png`.
- The banner must use empty alternative text and `aria-hidden="true"`.
- Support vertical document scrolling and prohibit horizontal scrolling.
- Verify 320 px and 390 px layouts before publishing.

---

### Task 1: Establish the regression test

**Files:**
- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: `body::before`, `.profile-hero__banner img`, and `.link-card`.
- Produces: a browser contract for the global backdrop, hero banner, and 66 px card scale.

- [ ] **Step 1: Change the card-size assertion**

```ts
await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '66px');
```

- [ ] **Step 2: Add the failing backdrop-and-banner assertion**

```ts
test('keeps a global illuminated backdrop and a scaled decorative hero banner', async ({ page }) => {
  await page.goto('/');
  const backdrop = await page.locator('body').evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return { backgroundImage: styles.backgroundImage, position: styles.position };
  });
  expect(backdrop.position).toBe('fixed');
  expect(backdrop.backgroundImage).toContain('radial-gradient');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('src', '/images/julismo-hero-wave.png');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('alt', '');
  await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '66px');
});
```

- [ ] **Step 3: Run the red test**

Run: `npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"`

Expected: FAIL because the current `body::before` is a solid glow and the banner element is absent.

### Task 2: Add the supplied banner structure

**Files:**
- Create: `public/images/julismo-hero-wave.png`
- Modify: `src/components/ProfileHero.astro`

**Interfaces:**
- Consumes: the supplied 1534 by 650 PNG.
- Produces: `.profile-hero__banner` behind the current profile identity.

- [ ] **Step 1: Copy the source asset**

Run: `Copy-Item -LiteralPath 'C:\Users\julis\Downloads\Gemini_Generated_Image_ov91cpov91cpov91__2___1_-removebg-preview (1).png' -Destination 'public\images\julismo-hero-wave.png'`

- [ ] **Step 2: Insert this as the first child of the existing profile header**

```astro
<div class="profile-hero__banner" aria-hidden="true">
  <img src="/images/julismo-hero-wave.png" alt="" width="1534" height="650" decoding="async" />
</div>
```

### Task 3: Implement backdrop and scale CSS

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing colour tokens and the new hero banner DOM.
- Produces: fixed illumination, masked banner layering, larger mobile primitives, and a vertical scrollbar treatment.

- [ ] **Step 1: Change `--content-width` to `390px` and shell width to `min(calc(100% - 24px), var(--content-width))`.**

- [ ] **Step 2: Give `body` the solid `var(--color-bg)`, then set `body::before` to `position: fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`, and `background: radial-gradient(ellipse 88% 38% at 50% -3%, #3b3b42 0%, #18181b 48%, var(--color-bg) 86%)`. Move the existing animated 240 px by 155 px glow to `body::after`.**

- [ ] **Step 3: Layer the banner behind foreground identity**

```css
.profile-hero { position: relative; isolation: isolate; padding-top: 68px; margin-bottom: 26px; }
.profile-hero__banner { position: absolute; z-index: 0; top: calc(-1 * clamp(34px, 9vw, 52px)); left: 50%; width: 100vw; height: clamp(180px, 50vw, 210px); overflow: hidden; pointer-events: none; transform: translateX(-50%); }
.profile-hero__banner::after { position: absolute; z-index: 1; inset: 0; background: linear-gradient(to bottom, rgb(10 10 11 / 5%) 0%, rgb(10 10 11 / 12%) 55%, var(--color-bg) 100%); content: ''; }
.profile-hero__banner img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: 0.86; }
.profile-hero__image, .profile-hero__name-row, .profile-hero__bio { position: relative; z-index: 1; }
```

- [ ] **Step 4: Apply the scale values**

Set profile photo width and height to `clamp(86px, 24vw, 94px)`; heading size to `clamp(1.45rem, 5vw, 1.62rem)`; bio size to `0.86rem`; card minimum height to `66px`; icon boxes to `38px`; card title size to `0.9rem`; card description size to `0.74rem`; and arrow size to `1.18rem`.

- [ ] **Step 5: Style only the vertical scrollbar**

```css
html { scrollbar-color: #5c5c65 var(--color-bg); scrollbar-width: thin; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { border: 2px solid var(--color-bg); border-radius: 999px; background: linear-gradient(#777780, #3c3c43); }
```

- [ ] **Step 6: Run the green test**

Run: `npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"`

Expected: PASS for every browser project, including the no-JS project because the backdrop and banner are static HTML and CSS.

### Task 4: Verify and publish

**Files:**
- Test: `tests/e2e/profile.spec.ts`

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: Astro check has 0 errors, warnings, and hints; Vitest passes; Playwright passes all applicable tests with only the intentional no-JS reduced-motion skip.

- [ ] **Step 2: Build and inspect a 390 by 844 screenshot**

Run: `npm run build`, then use the managed Playwright CLI to inspect the new banner, lower card placement, fixed illumination after scroll, legibility, and lack of horizontal overflow.

- [ ] **Step 3: Commit and push the isolated branch**

Run: `git add public/images/julismo-hero-wave.png src/components/ProfileHero.astro src/styles/tokens.css src/styles/global.css tests/e2e/profile.spec.ts docs/superpowers/specs/2026-08-07-global-backdrop-and-hero-banner-design.md docs/superpowers/plans/2026-08-07-global-backdrop-and-hero-banner.md && git commit -m "feat: expand hero backdrop and mobile scale" && git push -u origin fix/global-backdrop-hero-banner`

Expected: one focused commit is available remotely for review. The finishing workflow then integrates the reviewed branch into `development` and `main`, pushes both release branches, and deploys the merged `main` to the personal Vercel project.
