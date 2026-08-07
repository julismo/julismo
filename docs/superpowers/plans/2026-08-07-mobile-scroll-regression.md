# Mobile Scroll Regression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the approved 390 by 844 mobile profile has a real, comfortable vertical scroll state so the fixed global illumination can be verified after scrolling.

**Architecture:** Leave all page content and existing transform behavior intact. Add only mobile bottom breathing space to the page shell and encode the exact viewport's vertical-overflow, fixed-backdrop, and no-horizontal-overflow contract in the existing Playwright profile spec.

**Tech Stack:** Astro CSS, Playwright.

## Global Constraints

- At the `mobile-390` project (390 by 844), document height must exceed viewport height and a wheel action must move `window.scrollY` above zero.
- `body::before` remains a fixed radial background layer after the scroll.
- Do not change link destinations, card order, card minimum height, hero overlap, QR assets, or motion behavior.
- Horizontal scrolling remains prohibited.
- Restrict added breathing space to small mobile viewports; no JavaScript is required.

---

### Task 1: Restore a verifiable mobile scroll state

**Files:**
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `mobile-390` from `playwright.config.ts`, `.page-shell`, and fixed `body::before`.
- Produces: a Playwright regression test named `keeps the fixed backdrop visible after a real 390px mobile scroll` and mobile-only page-shell bottom breathing space.

- [ ] **Step 1: Add the failing exact-viewport regression test**

  Append this test to `tests/e2e/profile.spec.ts`:

  ```ts
  test('keeps the fixed backdrop visible after a real 390px mobile scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'This regression is specific to the 390 by 844 mobile viewport.');
    await page.goto('/');

    const initial = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    expect(initial.scrollHeight).toBeGreaterThan(initial.viewportHeight);
    expect(initial.horizontalOverflow).toBe(false);

    await page.mouse.wheel(0, 240);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const backdropPosition = await page.locator('body').evaluate((element) =>
      getComputedStyle(element, '::before').position,
    );
    expect(backdropPosition).toBe('fixed');
  });
  ```

- [ ] **Step 2: Run the focused Playwright test red**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "real 390px mobile scroll"`

  Expected: FAIL because the current document's `scrollHeight` equals its 844 px viewport height.

- [ ] **Step 3: Add the minimum mobile-only breathing space**

  Add this media rule after the existing base `.page-shell` declaration in `src/styles/global.css`:

  ```css
  @media (max-width: 480px) {
    .page-shell {
      padding-bottom: max(72px, 10svh);
    }
  }
  ```

  This replaces only the base 30 px lower padding at small widths, adding 54 px at 390 by 844 and allowing a natural short scroll without changing any card or hero dimensions.

- [ ] **Step 4: Run the focused regression green and inspect it visually**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "real 390px mobile scroll"`

  Expected: PASS. Capture managed Playwright screenshots before and after a wheel scroll at 390 by 844; the second state must have `scrollY > 0`, the illumination must remain visible, and there must be no horizontal scrollbar.

- [ ] **Step 5: Run the full suite and commit**

  Run: `npm test && npm run build`

  Expected: Astro reports zero diagnostics, all unit tests pass, all applicable browser tests pass, and the static build succeeds.

  Commit exactly these source and test files with:

  ```bash
  git add tests/e2e/profile.spec.ts src/styles/global.css
  git commit -m "fix: preserve mobile scroll room"
  ```

