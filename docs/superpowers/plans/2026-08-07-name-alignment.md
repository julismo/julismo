# Name and Verification Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centre the visible Julismo heading exactly while keeping the verification rosette deliberately offset to its right.

**Architecture:** Keep the existing heading and decorative image markup. Change the name row from a centred flex group to a full-width grid with the heading at its own centre; absolutely position the already decorative rosette relative to that row. A browser geometry test prevents the combined group from shifting the text again.

**Tech Stack:** Astro CSS, Playwright.

## Global Constraints

- The heading visual centre must be within one CSS pixel of the viewport centre at the `mobile-390` viewport.
- The verification rosette remains an `alt=""`, `aria-hidden="true"`, noninteractive image and begins to the right of the heading with visible spacing.
- Preserve portrait overlap, banner transition, cards, links, QR, motion, and responsive overflow behavior.
- Do not add JavaScript, a new interactive control, or a new asset.

---

### Task 1: Decouple the heading centre from the decorative badge

**Files:**
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `.profile-hero__name-row`, `.profile-hero h1`, and `img.verified-rosette`.
- Produces: a geometry regression contract and an independent badge position.

- [ ] **Step 1: Add the failing visual-geometry contract**

  Append this `mobile-390`-only test to `tests/e2e/profile.spec.ts`:

  ```ts
  test('centres the Julismo heading independently from its verification badge', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'This composition is calibrated at the primary mobile viewport.');
    await page.goto('/');

    const geometry = await page.locator('.profile-hero').evaluate((hero) => {
      const heading = hero.querySelector('h1')!.getBoundingClientRect();
      const badge = hero.querySelector('img.verified-rosette')!.getBoundingClientRect();
      return {
        headingCenter: heading.left + heading.width / 2,
        viewportCenter: window.innerWidth / 2,
        headingRight: heading.right,
        badgeLeft: badge.left,
      };
    });

    expect(Math.abs(geometry.headingCenter - geometry.viewportCenter)).toBeLessThanOrEqual(1);
    expect(geometry.badgeLeft).toBeGreaterThan(geometry.headingRight + 6);
  });
  ```

- [ ] **Step 2: Run the focused test red**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "centres the Julismo heading"`

  Expected: FAIL because flex currently centres the heading and rosette as one group, leaving the heading left of viewport centre.

- [ ] **Step 3: Centre only the heading and position the badge separately**

  Replace the existing `.profile-hero__name-row` and `.verified-rosette` positioning declarations in `src/styles/global.css` with:

  ```css
  .profile-hero__name-row {
    display: grid;
    position: relative;
    width: 100%;
    place-items: center;
  }

  .verified-rosette {
    display: block;
    position: absolute;
    top: 50%;
    left: calc(50% + clamp(48px, 12.5vw, 52px));
    width: 21px;
    height: 21px;
    object-fit: contain;
    transform: translateY(-50%);
  }
  ```

  Keep the existing image source, `alt`, `aria-hidden`, dimensions, and no-interaction behavior unchanged.

- [ ] **Step 4: Run the focused test green and inspect the mobile composition**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "centres the Julismo heading"`

  Expected: PASS. With managed Playwright at 390 by 844, capture a screenshot and visually check that the name reads as centred and the badge sits cleanly to its right without clipping or collision.

- [ ] **Step 5: Run full verification and commit**

  Run: `npm test && npm run build`

  Expected: Astro reports zero diagnostics, all unit tests pass, all applicable Playwright tests pass, and the static build succeeds.

  Commit exactly the test and CSS implementation:

  ```bash
  git add tests/e2e/profile.spec.ts src/styles/global.css
  git commit -m "fix: centre profile name independently"
  ```

