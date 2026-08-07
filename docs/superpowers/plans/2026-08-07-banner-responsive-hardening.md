# Banner Replacement and Responsive Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero artwork with the supplied Banner.png, make its transition visually intentional and responsive, and turn the loose card arrows into polished visual actions.

**Architecture:** Retain the existing semantic banner and portrait structure. The image source becomes a supplied local asset; the banner gains a static layered lower-edge treatment so it resolves into the fixed backdrop with hierarchy. Root clipping and shell sizing protect the existing full-bleed and gyroscope transforms at narrow/zoom-equivalent widths. Each link keeps one anchor as the only interactive control and gains a decorative SVG action span.

**Tech Stack:** Astro, CSS, Playwright.

## Global Constraints

- Copy `C:\Users\julis\Downloads\Banner.png` unchanged to `public/images/julismo-hero-banner.png`; it is 1584 by 396 px.
- The hero remains decorative, full-bleed, inaccessible to pointer interaction, and the centred 94 px portrait continues to straddle its lower edge.
- On small screens, crop toward the image's right-side authored role/technology artwork using `object-position: right center`.
- Use a progressive dark veil and one subtle inset silver hairline to separate banner and page background; add no new animation or JavaScript.
- At 280 px and 390 px effective widths there must be no horizontal overflow. Preserve real vertical scrolling, fixed illumination, five links, card order, QR assets, reduced-motion behavior, and no-JS behavior.
- Replace only the loose `↗` glyph with an `aria-hidden` circular `.link-card__action`; do not nest a `<button>` within the card anchor.

---

### Task 1: Replace the banner and protect its responsive boundary

**Files:**
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `src/components/ProfileHero.astro`
- Modify: `src/components/LinkCard.astro`
- Modify: `src/styles/global.css`
- Create: `public/images/julismo-hero-banner.png`

**Interfaces:**
- Consumes: the exact local `Banner.png` source, `.profile-hero__banner`, `.profile-hero__image`, `.link-card`, and the existing fixed `body::before` backdrop.
- Produces: `/images/julismo-hero-banner.png` in decorative hero markup, an inspectable lower-edge transition pseudo-layer, a decorative `.link-card__action`, and a narrow-width overflow contract.

- [ ] **Step 1: Change the browser contract before changing production code**

  In the existing `keeps a global illuminated backdrop and a scaled decorative hero banner` test, replace the old asset assertion and add the edge-layer check:

  ```ts
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute(
    'src',
    '/images/julismo-hero-banner.png',
  );
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('width', '1584');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('height', '396');

  const edgeLayer = await page.locator('.profile-hero__banner').evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return { backgroundImage: styles.backgroundImage, height: styles.height };
  });
  expect(edgeLayer.backgroundImage).toContain('linear-gradient');
  expect(edgeLayer.height).not.toBe('0px');
  await expect(page.locator('.link-card__action')).toHaveCount(5);
  await expect(page.locator('.link-card__action').first()).toHaveAttribute('aria-hidden', 'true');
  ```

  Add a `mobile-390`-only test that changes the viewport to 280, 320, and 390 px, visits `/` at each width, and asserts `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 2: Run the focused test red**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "global illuminated backdrop|narrow effective widths"`

  Expected: FAIL because the markup still names `julismo-hero-wave.png` and no `::before` edge layer exists.

- [ ] **Step 3: Copy the supplied image and update semantic image metadata**

  Run:

  ```powershell
  Copy-Item -LiteralPath 'C:\Users\julis\Downloads\Banner.png' -Destination 'public\images\julismo-hero-banner.png'
  ```

  In `src/components/ProfileHero.astro`, preserve empty `alt`, `aria-hidden="true"` on the enclosing banner, and `decoding="async"`; change only the banner image source and intrinsic dimensions:

  ```astro
  <img src="/images/julismo-hero-banner.png" alt="" width="1584" height="396" decoding="async" />
  ```

  In `src/components/LinkCard.astro`, replace the current arrow span with the decorative visual action:

  ```astro
  <span class="link-card__action" aria-hidden="true">
    <svg class="link-card__action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
  ```

  Replace `.link-card__arrow` with `.link-card__action` in the existing shared z-index selector and delete the unused `.link-card__arrow` style block.

- [ ] **Step 4: Add the static edge treatment and responsive safeguards**

  In `src/styles/global.css`:

  ```css
  html {
    min-width: 0;
    overflow-x: clip;
  }

  .page-shell {
    min-width: 0;
  }

  .profile-hero__banner {
    z-index: 0;
  }

  .profile-hero__banner::before {
    position: absolute;
    z-index: 2;
    right: 10%;
    bottom: 2px;
    left: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 12%) 15%, rgb(239 239 244 / 46%) 50%, rgb(255 255 255 / 12%) 85%, transparent);
    box-shadow: 0 0 16px rgb(255 255 255 / 9%), 0 8px 22px rgb(0 0 0 / 46%);
    content: '';
    pointer-events: none;
  }

  .profile-hero__banner::after {
    z-index: 1;
    background: linear-gradient(to bottom, transparent 42%, rgb(10 10 11 / 14%) 65%, rgb(10 10 11 / 76%) 88%, var(--color-bg));
  }

  .link-card__action {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 17%);
    border-radius: 50%;
    background: linear-gradient(145deg, rgb(255 255 255 / 10%), rgb(0 0 0 / 22%));
    box-shadow: inset 0 1px 1px rgb(255 255 255 / 8%), 0 3px 10px rgb(0 0 0 / 24%);
    color: #e8e8ec;
  }

  .link-card__action-icon {
    width: 15px;
    height: 15px;
  }

  .link-card:hover .link-card__action {
    border-color: rgb(255 255 255 / 34%);
    background: linear-gradient(145deg, rgb(255 255 255 / 16%), rgb(0 0 0 / 20%));
  }

  @media (max-width: 480px) {
    .profile-hero__banner img {
      object-position: right center;
    }
  }
  ```

  Keep existing `pointer-events`, `overflow`, and portrait z-index behavior unchanged.

- [ ] **Step 5: Run focused tests green and inspect the real scroll state**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "global illuminated backdrop|narrow effective widths|real 390px mobile scroll"`

  Expected: PASS. With managed Playwright at 390 by 844, capture screenshots before and after wheel scrolling; verify `scrollY > 0`, the portrait remains above the separator, the line is restrained, the banner resolves into the page background, and there is no horizontal scrollbar.

- [ ] **Step 6: Run full verification and commit the focused implementation**

  Run: `npm test && npm run build`

  Expected: Astro reports zero diagnostics, Vitest passes, all applicable Playwright tests pass, and the static build succeeds.

  Commit only the changed test, components, CSS, and new image:

  ```bash
  git add tests/e2e/profile.spec.ts src/components/ProfileHero.astro src/components/LinkCard.astro src/styles/global.css public/images/julismo-hero-banner.png
  git commit -m "feat: refine banner boundary and card actions"
  ```
