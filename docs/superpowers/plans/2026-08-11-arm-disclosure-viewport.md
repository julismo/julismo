# ARM disclosure viewport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the expanded ARM Solutions card reveal itself cleanly in a narrow mobile viewport instead of appearing cut off below the fold.

**Architecture:** Retain the native `<details>/<summary>` disclosure and its existing carousel. Its existing `toggle` handler will measure the expanded disclosure on the next animation frame and scroll the summary into view only when the card extends below the current viewport. CSS supplies scroll clearance and a decorative reveal that is disabled for reduced-motion users.

**Tech Stack:** Astro, browser TypeScript in an Astro component, CSS, Playwright.

## Global Constraints

- Preserve native `<details>/<summary>` semantics, the ARM card geometry, link order, and keyboard order.
- Only scroll after opening when the fully expanded disclosure extends below the current usable viewport.
- Use `smooth` scrolling normally and `auto` scrolling when `prefers-reduced-motion: reduce` matches.
- Keep the approved 8-second ARM carousel rotation and its existing manual-selection, hover, and reduced-motion rules.
- Add no dependency, page, external service, or horizontal overflow.

---

### Task 1: Reveal the expanded ARM disclosure in context

**Files:**
- Modify: `tests/e2e/profile.spec.ts` after the ARM progressive-reveal test
- Modify: `src/components/SolutionDisclosure.astro` in the existing `data-solutions-disclosure` script
- Modify: `src/styles/global.css` next to `.solution-disclosure` and inside the existing reduced-motion media query

**Interfaces:**
- Consumes: native `toggle` event on `details[data-solutions-disclosure]`, the existing `summary[data-arm-summary]`, and `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- Produces: a viewport-aware reveal that keeps the opened ARM disclosure fully visible when it would otherwise extend beyond the fold.

- [ ] **Step 1: Write the failing mobile viewport regression test**

  Add this Playwright test after the existing progressive ARM disclosure test. It must run only in the `mobile-320` project and start from the top of the page:

  ```ts
  test('brings the expanded ARM disclosure fully into the narrow mobile viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-320', 'Viewport recovery is covered at the narrowest supported mobile width.');

    await page.goto('/');
    const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
    await disclosure.locator('summary[data-arm-summary]').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await expect.poll(async () => disclosure.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return window.scrollY > 0 && box.top >= 8 && box.bottom <= window.innerHeight - 8;
    })).toBe(true);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.viewportWidth);
  });
  ```

- [ ] **Step 2: Run the focused test and verify it fails on the current behaviour**

  Run:

  ```powershell
  npx playwright test tests/e2e/profile.spec.ts --project=mobile-320 -g "brings the expanded ARM disclosure fully into the narrow mobile viewport"
  ```

  Expected: fail because `window.scrollY` remains `0` and the open card’s bottom lies below the 720px viewport.

- [ ] **Step 3: Add the minimal viewport-aware reveal implementation**

  In `SolutionDisclosure.astro`, define this helper before the existing `disclosure.addEventListener('toggle', ...)` block, then call it after `start()` inside the open branch:

  ```ts
  const revealDisclosure = () => {
    window.requestAnimationFrame(() => {
      if (!disclosure.hasAttribute('open')) return;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const bottom = disclosure.getBoundingClientRect().bottom;
      if (bottom <= viewportHeight - 8) return;

      disclosure.querySelector<HTMLElement>('summary[data-arm-summary]')?.scrollIntoView({
        behavior: reduced.matches ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });
  };
  ```

  Add CSS next to the disclosure rules:

  ```css
  .solution-disclosure > summary {
    scroll-margin-block-start: clamp(12px, 4vh, 32px);
  }

  .solution-disclosure[open] .solution-disclosure__panel {
    animation: solution-disclosure-reveal 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes solution-disclosure-reveal {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```

  In the existing `@media (prefers-reduced-motion: reduce)` block, add:

  ```css
  .solution-disclosure[open] .solution-disclosure__panel {
    animation: none;
  }
  ```

- [ ] **Step 4: Run focused behaviour and accessibility regression tests**

  Run:

  ```powershell
  npx playwright test tests/e2e/profile.spec.ts --project=mobile-320 --project=mobile-390 --project=desktop -g "brings the expanded ARM disclosure fully into the narrow mobile viewport|reveals ARM entry solutions progressively|ARM carousel supports manual keyboard selection|keeps ARM disclosure keyboard order logical|keeps the ARM disclosure action static when reduced motion is requested|has no horizontal overflow"
  ```

  Expected: all selected non-skipped tests pass; expected skips remain confined to project-specific coverage.

- [ ] **Step 5: Inspect the behaviour visually at 320×720, 390×844, and 1440×900**

  Run the local site through Playwright, open ARM from the top at each viewport, capture a screenshot after the reveal settles, and verify that the card has its own visible boundary, its content is not visually cut off, and the following LinkedIn link remains reachable through normal vertical scrolling.

- [ ] **Step 6: Run the full quality gate**

  Run:

  ```powershell
  npm test
  npm run build
  git diff --check
  ```

  Expected: Astro diagnostics are clean, unit and Playwright tests pass with only intentional skips, the static build succeeds, and `git diff --check` has no output.

- [ ] **Step 7: Commit the scoped change**

  Run:

  ```powershell
  git add src/components/SolutionDisclosure.astro src/styles/global.css tests/e2e/profile.spec.ts docs/superpowers/specs/2026-08-11-arm-disclosure-viewport-design.md docs/superpowers/plans/2026-08-11-arm-disclosure-viewport.md
  git commit -m "fix: reveal expanded ARM solutions in viewport"
  ```
