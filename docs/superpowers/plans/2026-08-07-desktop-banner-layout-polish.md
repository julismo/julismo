# Desktop Banner and Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the desktop banner show the programming-language artwork cleanly, make the profile card hierarchy deliberate at every viewport, and remove the site-imposed persistent scrollbar appearance without changing functional behaviour.

**Architecture:** Keep the profile as one static Astro page. The implementation is intentionally limited to existing template copy, responsive CSS, and Playwright geometry/overflow regressions. Mobile keeps the current near-full-width card column; desktop overrides only its maximum width, hero crop, lower fade, and whitespace.

**Tech Stack:** Astro 7, CSS media queries, Playwright E2E, npm scripts.

## Global Constraints

- Use European Portuguese UI copy: `SOLUÇÕES`.
- Do not alter any link URL, Cal.com modal behaviour, QR asset, email behaviour, or iPhone motion-consent script.
- Mobile cards fill the content column but retain 12–16 px safe gutters; they must not be flush to the viewport.
- Desktop cards remain a centred maximum 430 px column; never expand to browser edge-to-edge width.
- At 1440 by 900 CSS pixels, this polish must not create vertical overflow by itself; a genuine short/zoomed viewport must retain native scrolling.
- Do not hide scrolling or add a custom scrollbar track/thumb. Keep `overflow-x: clip` and prove no horizontal overflow.
- Preserve the current mobile banner crop. Desktop/tablet use the lower banner focal point and a lower, lighter fade so the language row remains legible.
- Preserve existing unrelated dirty files in the worktree. Stage only files named in each task.

---

### Task 1: Establish responsive layout regression contracts

**Files:**
- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: existing profile DOM hooks: `.profile-hero__banner`, `.profile-hero__banner img`, `.link-card`, `[data-link-id="arm"]`, `.link-section-label`.
- Produces: executable proof that desktop uses the lower banner focal point, an unobtrusive scrollbar style, a 430 px card column, a copy-aligned `SOLUÇÕES` label, and that mobile uses safe full-width cards without horizontal overflow.

- [ ] **Step 1: Update the existing focal-point expectation, then add the failing desktop contract after it.**

In the existing `uses a desktop banner focal point without changing the mobile crop` test, replace:

```ts
expect(objectPosition).toBe('50% 76%');
```

with:

```ts
expect(objectPosition).toBe('50% 100%');
```

Then add this contract:

```ts
test('keeps the desktop banner legible and the solutions hierarchy contained', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop composition is calibrated once at 1440 by 900.');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const layout = await page.locator('body').evaluate((body) => {
    const banner = document.querySelector<HTMLElement>('.profile-hero__banner')!;
    const image = banner.querySelector('img')!;
    const card = document.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;
    const section = document.querySelector<HTMLElement>('.link-section-label')!;
    const armCopy = document.querySelector<HTMLElement>('[data-link-id="arm"] .link-card__copy')!;
    const cardBox = card.getBoundingClientRect();
    const sectionBox = section.getBoundingClientRect();
    const armCopyBox = armCopy.getBoundingClientRect();

    return {
      bannerHeight: banner.getBoundingClientRect().height,
      imagePosition: getComputedStyle(image).objectPosition,
      scrollbarWidth: getComputedStyle(body).scrollbarWidth,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      cardWidth: cardBox.width,
      cardCenter: cardBox.left + cardBox.width / 2,
      sectionText: section.textContent?.trim(),
      sectionLeft: sectionBox.left,
      armCopyLeft: armCopyBox.left,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(layout.imagePosition).toBe('50% 100%');
  expect(layout.bannerHeight).toBeGreaterThanOrEqual(230);
  expect(layout.scrollbarWidth).toBe('auto');
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.cardWidth).toBeGreaterThanOrEqual(429);
  expect(Math.abs(layout.cardCenter - 720)).toBeLessThanOrEqual(1);
  expect(layout.sectionText).toBe('SOLUÇÕES');
  expect(Math.abs(layout.sectionLeft - layout.armCopyLeft)).toBeLessThanOrEqual(1);
  expect(layout.horizontalOverflow).toBe(false);
});
```

- [ ] **Step 2: Add the mobile safe-gutter contract immediately after the desktop contract.**

```ts
test('keeps cards nearly full width within mobile safe gutters', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Safe touch gutters are calibrated at the primary mobile viewport.');

  await page.goto('/');

  const geometry = await page.locator('[data-link-id="whatsapp"]').evaluate((card) => {
    const box = card.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      width: box.width,
      viewportWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(geometry.left).toBeGreaterThanOrEqual(12);
  expect(geometry.left).toBeLessThanOrEqual(16);
  expect(geometry.viewportWidth - geometry.right).toBeGreaterThanOrEqual(12);
  expect(geometry.viewportWidth - geometry.right).toBeLessThanOrEqual(16);
  expect(geometry.width).toBeGreaterThanOrEqual(geometry.viewportWidth - 32);
  expect(geometry.horizontalOverflow).toBe(false);
});
```

- [ ] **Step 3: Run the focused test to prove the current implementation is red.**

Run in PowerShell:

```powershell
$env:CI = '1'
npx playwright test tests/e2e/profile.spec.ts --project=desktop --project=mobile-390 --grep "desktop banner legible|mobile safe gutters"
Remove-Item Env:CI
```

Expected: the new desktop contract fails because the current image position is `50% 76%`, the banner is 210 px, the card column is 390 px, `TRABALHO` still exists, and the custom scrollbar width is `thin`. The mobile contract may already pass.

- [ ] **Step 4: Commit the regression contract only.**

```powershell
git add tests/e2e/profile.spec.ts
git commit -m "test: cover desktop profile layout polish"
```

### Task 2: Implement the constrained responsive composition

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/profile.spec.ts`

**Interfaces:**
- Consumes: the exact selectors and geometry contracts created in Task 1.
- Produces: a desktop/tablet CSS override that preserves the mobile layout, a `SOLUÇÕES` label attached to ARM, and native scrollbar treatment when scrolling is genuinely needed.

- [ ] **Step 1: Change the single section label in `src/pages/index.astro`.**

Replace the existing conditional label with:

```astro
{link.section === 'work' && <span class="link-section-label">SOLUÇÕES</span>}
```

- [ ] **Step 2: Remove the global custom vertical scrollbar declarations in `src/styles/global.css`.**

Delete the two `body` declarations:

```css
scrollbar-color: #8d8d96 #050506;
scrollbar-width: thin;
```

Delete the entire custom WebKit block:

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #050506;
}

::-webkit-scrollbar-thumb {
  border: 2px solid #050506;
  border-radius: 999px;
  background: linear-gradient(#bdbdc5, #71717a);
}
```

Do not replace those rules with `overflow-y: scroll`, `scrollbar-width: none`, or any other forced scrollbar treatment.

- [ ] **Step 3: Add the responsive desktop overrides to `src/styles/global.css`.**

Keep the existing mobile base rules unchanged. After the existing mobile banner image media query, add:

```css
@media (min-width: 768px) {
  .page-shell {
    width: min(calc(100% - 48px), 430px);
    padding-bottom: 10px;
  }

  .profile-hero__banner {
    height: clamp(210px, 16vw, 260px);
  }

  .profile-hero__banner::after {
    background: linear-gradient(to bottom, transparent 76%, rgb(10 10 11 / 8%) 88%, var(--color-bg));
  }

  .profile-hero__banner img {
    object-position: center bottom;
  }
}
```

Update the existing label rule so its text box aligns with the card copy column:

```css
.link-section-label {
  justify-self: start;
  margin: 6px 0 -1px 58px;
  color: var(--color-faint);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}
```

This keeps the 390 px/12 px mobile column untouched, increases the desktop card column to 430 px, keeps the 1440 by 900 page inside its viewport by trading 20 px of desktop bottom padding for the additional banner height, and exposes the lower artwork without changing the narrow-screen crop.

- [ ] **Step 4: Run the focused regression suite and confirm it is green.**

Run in PowerShell:

```powershell
$env:CI = '1'
npx playwright test tests/e2e/profile.spec.ts --project=desktop --project=mobile-390 --grep "desktop banner legible|mobile safe gutters|desktop banner focal point"
Remove-Item Env:CI
```

Expected: all selected tests pass. The desktop assertion reports `50% 100%`, a banner height of at least 230 px, `scrollbarWidth` of `auto`, a 430 px card column, `SOLUÇÕES` aligned to ARM copy, no overflow, and no self-created vertical scroll at 1440 by 900. Mobile retains right/centre image framing and 12–16 px gutters.

- [ ] **Step 5: Run the complete quality gate and production build.**

Run in separate PowerShell commands:

```powershell
npm test
npm run build
```

Expected: Astro check has 0 diagnostics, all Vitest tests pass, all Playwright tests pass or keep their documented intentional skips, and Astro builds the production page successfully.

- [ ] **Step 6: Capture and inspect local visual evidence.**

Start a temporary local server in a hidden window, then use the Playwright CLI with a new `layout-polish` session:

```powershell
$server = Start-Process npm.cmd -ArgumentList 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '4321' -WindowStyle Hidden -PassThru
npx --package @playwright/cli playwright-cli -s=layout-polish open http://127.0.0.1:4321
npx --package @playwright/cli playwright-cli -s=layout-polish resize 1440 900
npx --package @playwright/cli playwright-cli -s=layout-polish screenshot --filename layout-desktop.png
npx --package @playwright/cli playwright-cli -s=layout-polish resize 390 844
npx --package @playwright/cli playwright-cli -s=layout-polish screenshot --filename layout-mobile.png
npx --package @playwright/cli playwright-cli -s=layout-polish close
Stop-Process -Id $server.Id
```

Inspect both screenshots. Desktop must show the full technology row without a dark cut through it; cards must be a quiet centred column; `SOLUÇÕES` must read as attached to ARM. Mobile cards must fill the screen comfortably without touching the viewport edge. Do not commit the screenshot artifacts.

- [ ] **Step 7: Commit the implementation only.**

```powershell
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: polish desktop banner and link hierarchy"
git status --short
```

Expected: only the known pre-existing worktree reports remain unstaged; no screenshot or unrelated file is staged.

## Plan self-review

- Spec coverage: Task 1 covers geometry, mobile safe gutters, label copy/alignment, native scrollbar styling, and overflow. Task 2 implements every scoped design decision and checks the complete quality gate plus visual screenshots.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or undefined test behaviour remains.
- Consistency: all selectors, copy, dimensions, viewport sizes, and expected browser values are shared between the test and CSS tasks. The desktop 230 px target follows `clamp(210px, 16vw, 260px)` at 1440 px; reducing desktop bottom padding from 30 px to 10 px preserves the 1440 by 900 non-overflow constraint.
