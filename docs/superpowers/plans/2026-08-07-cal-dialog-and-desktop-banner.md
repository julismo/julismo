# Cal.com Dialog and Desktop Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fast, progressively enhanced Cal.com booking experience and make the desktop banner reveal Julismo's technology stack without changing the approved mobile crop.

**Architecture:** Keep the profile static by default. The Cal contact card is an ordinary external link in HTML and becomes an in-page booking trigger only after client JavaScript attaches; a native dialog owns the visual shell and dynamically imports Cal's embed snippet on intent. The banner focal point uses a desktop-only CSS rule, leaving the existing mobile focal point untouched.

**Tech Stack:** Astro 7, TypeScript, CSS, `@calcom/embed-snippet`, Vitest, Playwright.

## Global Constraints

- Booking URL is exactly `https://cal.com/julismo-costa-3nxpms/30min`; its Cal link path is exactly `julismo-costa-3nxpms/30min`.
- The initial page may not request `cal.com` or `app.cal.com`; Cal code loads only after booking intent.
- The booking card is titled exactly `Agendar diagnóstico`, sits immediately after WhatsApp, uses the existing black-and-silver card system, and remains usable as an external new-tab link with JavaScript disabled.
- WhatsApp, ARM, and Cal use crisp vector marks inside the same dark circular treatment as Email, GitHub, and X; do not introduce AI-generated raster brand logos.
- The dialog must close by its control, Escape, and backdrop click; it locks background scroll, restores focus to its trigger, and honours reduced motion.
- Mobile crop remains `right center` at widths through 480 px. Desktop crop is `center 76%` above 480 px.
- Preserve portrait overlap, global backdrop, all existing link destinations, QR assets, scroll behaviour, and responsive overflow protection.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` / `package-lock.json` | Declare the lazy-loadable Cal embed snippet package. |
| `src/lib/profile.ts` | Extend profile link and icon unions with the Cal booking entry. |
| `src/data/profile.ts` | Place the approved booking card after WhatsApp. |
| `src/components/BrandIcon.astro` | Render the calendar icon and retain crisp vector marks in the unified icon container. |
| `src/components/LinkCard.astro` | Give a booking card stable dialog-trigger data while retaining its external-link fallback. |
| `src/components/CalDialog.astro` | Render the accessible native dialog, fallback link, and isolated booking embed container. |
| `src/scripts/cal-dialog.ts` | Enhance booking links, lazy-import Cal, initialise one inline embed, manage dialog lifecycle. |
| `src/pages/index.astro` | Render the dialog once and load its client enhancement. |
| `src/styles/global.css` | Style the dialog and apply the desktop-only banner crop. |
| `tests/unit/profile.test.ts` | Lock data order, copy, URL, and navigation policy. |
| `tests/e2e/profile.spec.ts` | Cover link fallback, no initial Cal request, dialog accessibility/lifecycle, and focal-point breakpoints. |

### Task 1: Booking-card data contract and progressive fallback

**Files:**
- Modify: `src/lib/profile.ts:1-23`
- Modify: `src/data/profile.ts:8-55`
- Modify: `src/components/BrandIcon.astro:1-58`
- Modify: `src/components/LinkCard.astro:1-34`
- Modify: `src/styles/global.css:236-278,360-366`
- Modify: `tests/unit/profile.test.ts:4-53`
- Modify: `tests/e2e/profile.spec.ts:3-93`

**Interfaces:**
- Consumes: existing `ProfileLink`, existing card visual classes, existing `assertProfileLinks()` validation.
- Produces: `ProfileLink` id/icon `cal`, optional `interaction: 'cal-dialog'`, and an anchor with `data-cal-trigger`, `aria-haspopup="dialog"`, and `aria-controls="cal-dialog"` when that interaction is selected.

- [ ] **Step 1: Write failing data and DOM contracts**

Add the booking entry to both expected arrays before implementation:

```ts
  { id: 'cal', title: 'Agendar diagnóstico', description: '30 min · escolha o melhor horário', section: 'contact' }
```

```ts
{ id: 'cal', href: 'https://cal.com/julismo-costa-3nxpms/30min', external: true }
```

Change the card-count expectation from five to six and add this Playwright assertion:

```ts
const bookingCard = page.locator('[data-link-id="cal"]');
await expect(bookingCard).toHaveAttribute('href', 'https://cal.com/julismo-costa-3nxpms/30min');
await expect(bookingCard).toHaveAttribute('target', '_blank');
await expect(bookingCard).toHaveAttribute('rel', 'noopener noreferrer');
await expect(bookingCard).toHaveAttribute('data-cal-trigger', '');
await expect(bookingCard).toHaveAttribute('aria-haspopup', 'dialog');
await expect(bookingCard).toHaveAttribute('aria-controls', 'cal-dialog');

for (const id of ['whatsapp', 'arm', 'cal']) {
  const icon = page.locator(`[data-link-id="${id}"] .link-card__icon`);
  const shape = await icon.evaluate((element) => {
    const styles = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { borderRadius: styles.borderRadius, width: rect.width, height: rect.height };
  });
  expect(shape.borderRadius).toBe('50%');
  expect(shape.width).toBe(shape.height);
}
await expect(page.locator('[data-link-id="arm"] .link-card__icon')).not.toHaveClass(/link-card__icon--arm/);
```

- [ ] **Step 2: Run the focused contracts to verify they fail**

Run:

```bash
cd /c/dev/julismo/.worktrees/fix-global-backdrop-hero-banner && npm run test:unit && npx playwright test tests/e2e/profile.spec.ts --project=desktop
```

Expected: the visual hierarchy and destination tests fail because `cal` is absent; the card test fails because no trigger exists.

- [ ] **Step 3: Implement the minimal profile/card surface**

Use the following model additions:

```ts
export type LinkId = 'whatsapp' | 'cal' | 'arm' | 'email' | 'github' | 'x';
export type IconName = LinkId;

export interface ProfileLink {
  // existing fields
  interaction?: 'cal-dialog';
}
```

Add the Cal entry directly after WhatsApp:

```ts
{
  id: 'cal',
  title: 'Agendar diagnóstico',
  description: '30 min · escolha o melhor horário',
  href: 'https://cal.com/julismo-costa-3nxpms/30min',
  icon: 'cal',
  section: 'contact',
  external: true,
  interaction: 'cal-dialog',
}
```

In `LinkCard.astro`, preserve the `<a>` and compose trigger attributes only for the booking interaction:

```ts
const calAttributes = link.interaction === 'cal-dialog'
  ? { 'data-cal-trigger': '', 'aria-haspopup': 'dialog', 'aria-controls': 'cal-dialog' }
  : {};
```

Spread `calAttributes` on the anchor after `externalAttributes`. Add a 24-by-24, rounded-line calendar SVG branch for `name === 'cal'` in `BrandIcon.astro`; it must have `aria-hidden="true"` and use `currentColor`.

Remove the bright square ARM override and the primary-card white WhatsApp-icon override. Remove the `link-card__icon--arm` class emission from `LinkCard.astro`. Keep all three marks inside the existing dark circular `.link-card__icon` plate, using the same subtle silver border and neutral `currentColor` already used by Email, GitHub, and X. Preserve the official WhatsApp path and the ARM wordmark rather than replacing them with AI-generated raster images.

- [ ] **Step 4: Run focused contracts to verify they pass**

Run the Step 2 command again.

Expected: Vitest passes and desktop E2E finds six cards, the exact booking fallback URL, and the trigger semantics.

- [ ] **Step 5: Commit the independently working contact card**

```bash
git add src/lib/profile.ts src/data/profile.ts src/components/BrandIcon.astro src/components/LinkCard.astro tests/unit/profile.test.ts tests/e2e/profile.spec.ts
git commit -m "feat: add Cal.com booking contact card"
```

### Task 2: Lazy, accessible Cal.com dialog

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/CalDialog.astro`
- Create: `src/scripts/cal-dialog.ts`
- Modify: `src/pages/index.astro:1-25`
- Modify: `src/styles/global.css:419-453`
- Modify: `tests/e2e/profile.spec.ts:1-112`

**Interfaces:**
- Consumes: `[data-cal-trigger]`, exact `cal-dialog` id, and the profile card's URL.
- Produces: one native `<dialog id="cal-dialog">`, one `#cal-embed-container`, and an enhancement module that initialises Cal exactly once after intent.

- [ ] **Step 1: Write failing lazy-dialog browser contracts**

Add an E2E test (skipped for `no-js`) that first records Cal-host requests, then verifies the dialog lifecycle:

```ts
const calRequests: string[] = [];
page.on('request', (request) => {
  if (/(^|\.)cal\.com\//.test(new URL(request.url()).hostname + '/')) {
    calRequests.push(request.url());
  }
});

await page.goto('/');
await expect(page.locator('#cal-dialog')).toBeHidden();
expect(calRequests).toEqual([]);

const bookingCard = page.locator('[data-cal-trigger]');
await bookingCard.click();
const dialog = page.locator('#cal-dialog');
await expect(dialog).toBeVisible();
await expect(dialog).toHaveAttribute('open', '');
await expect(dialog).toHaveAttribute('aria-labelledby', 'cal-dialog-title');
await expect(dialog.getByRole('link', { name: /abrir.*nova página/i })).toHaveAttribute(
  'href',
  'https://cal.com/julismo-costa-3nxpms/30min',
);
await page.keyboard.press('Escape');
await expect(dialog).not.toHaveAttribute('open', '');
await expect(bookingCard).toBeFocused();
```

Add a second test that opens the dialog, clicks its backdrop at a coordinate outside the dialog panel, and expects `open` to be absent.

- [ ] **Step 2: Run the focused browser tests to verify they fail**

Run:

```bash
cd /c/dev/julismo/.worktrees/fix-global-backdrop-hero-banner && npx playwright test tests/e2e/profile.spec.ts --project=desktop
```

Expected: failure because `#cal-dialog` and its client lifecycle do not exist.

- [ ] **Step 3: Add the dependency and dialog markup**

Install the same snippet package used by the Trion site:

```bash
npm install @calcom/embed-snippet@^1.3.3
```

Create `CalDialog.astro` with this stable shell:

```astro
---
const bookingUrl = 'https://cal.com/julismo-costa-3nxpms/30min';
---

<dialog id="cal-dialog" class="cal-dialog" aria-labelledby="cal-dialog-title">
  <div class="cal-dialog__panel">
    <header class="cal-dialog__header">
      <h2 id="cal-dialog-title">Agendar diagnóstico</h2>
      <button type="button" class="cal-dialog__close" data-cal-close aria-label="Fechar agendamento">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </header>
    <p class="cal-dialog__status" data-cal-status role="status">A preparar o calendário…</p>
    <div id="cal-embed-container" class="cal-dialog__embed"></div>
    <footer class="cal-dialog__footer">
      <a href={bookingUrl} target="_blank" rel="noopener noreferrer">Ou abrir em nova página</a>
    </footer>
  </div>
</dialog>
```

Render `<CalDialog />` once after the main content in `src/pages/index.astro`, and include the enhancement script after the existing motion import.

- [ ] **Step 4: Implement one-time lazy enhancement**

Create `src/scripts/cal-dialog.ts` with these constants and lifecycle rules:

```ts
const CAL_LINK = 'julismo-costa-3nxpms/30min';
const dialog = document.querySelector<HTMLDialogElement>('#cal-dialog');
const triggers = document.querySelectorAll<HTMLAnchorElement>('[data-cal-trigger]');
const closeButton = document.querySelector<HTMLButtonElement>('[data-cal-close]');
const embedContainer = document.querySelector<HTMLElement>('#cal-embed-container');
const status = document.querySelector<HTMLElement>('[data-cal-status]');

let previousOverflow = '';
let activeTrigger: HTMLAnchorElement | null = null;
let calPromise: Promise<void> | null = null;
let hasMounted = false;
```

`ensureCal()` must dynamically import `@calcom/embed-snippet`, call `EmbedSnippet()`, initialise it with `{ origin: 'https://cal.com' }`, and mount exactly one `Cal('inline', { calLink: CAL_LINK, elementOrSelector: '#cal-embed-container', config: { layout: mobile ? 'column_view' : 'month_view', theme: 'dark' } })`. It sets the status text to an error only on rejected loading and never clears/recreates the container after a successful first mount.

For every trigger, add `pointerenter` and `focus` listeners that call `void ensureCal()`; add a `click` handler that calls `event.preventDefault()`, records `activeTrigger`, calls `dialog.showModal()`, locks `document.body.style.overflow`, and calls `void ensureCal()`.

Implement close handling with `dialog.close()`, its `close` event (restore the exact previous overflow value and focus `activeTrigger`), `cancel` (allow native Escape close), close button click, and `dialog` click when `event.target === dialog` for backdrop close. Set `document.documentElement.dataset.calDialog = 'ready'` only after all handlers attach.

- [ ] **Step 5: Style the dialog without changing card language**

Append focused rules that use only the existing palette and radii:

```css
.cal-dialog { width: min(640px, calc(100vw - 32px)); max-width: none; height: min(800px, calc(100dvh - 32px)); max-height: none; border: 1px solid rgb(255 255 255 / 14%); border-radius: 22px; background: #111113; color: var(--color-text); box-shadow: 0 24px 80px rgb(0 0 0 / 65%); padding: 0; }
.cal-dialog::backdrop { background: rgb(0 0 0 / 68%); backdrop-filter: blur(8px); }
.cal-dialog__panel { display: grid; grid-template-rows: auto 1fr auto; height: 100%; overflow: hidden; }
.cal-dialog__embed { min-height: 600px; overflow: auto; }
@media (max-width: 480px) { .cal-dialog { width: 100vw; height: 100dvh; border: 0; border-radius: 0; } .cal-dialog__embed { min-height: calc(100dvh - 118px); } }
@media (prefers-reduced-motion: no-preference) { .cal-dialog[open] { animation: cal-dialog-in 180ms ease-out; } }
```

Complete the header, close control, status, and footer styles with the existing line/border/color tokens. Add `@keyframes cal-dialog-in` and ensure the existing reduced-motion rule disables it through the global animation override.

- [ ] **Step 6: Run dialog tests to verify they pass**

Run the Step 2 command again.

Expected: the page makes no Cal-host request on initial navigation; activation opens the modal; Escape and backdrop close it; fallback URL remains exact.

- [ ] **Step 7: Capture controlled visual evidence**

Use the managed Playwright CLI at 390 by 844 and 1440 by 900. Open the booking card, capture screenshots into `output/playwright/`, inspect the modal, then close the session before broader test execution.

- [ ] **Step 8: Commit the dialog**

```bash
git add package.json package-lock.json src/components/CalDialog.astro src/scripts/cal-dialog.ts src/pages/index.astro src/styles/global.css tests/e2e/profile.spec.ts
git commit -m "feat: add lazy Cal.com booking dialog"
```

### Task 3: Desktop-only banner focal point and release regression

**Files:**
- Modify: `src/styles/global.css:128-139`
- Modify: `tests/e2e/profile.spec.ts:26-60`
- Modify: `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: the existing decorative `img` inside `.profile-hero__banner` and the approved breakpoint of 480 px.
- Produces: desktop computed crop `50% 76%`, mobile computed crop `100% 50%`, and verified visual evidence for both compositions.

- [ ] **Step 1: Write failing focal-point assertions**

Add a project-scoped E2E test:

```ts
test('uses a desktop banner focal point without changing the mobile crop', async ({ page }, testInfo) => {
  await page.goto('/');
  const objectPosition = await page.locator('.profile-hero__banner img').evaluate(
    (image) => getComputedStyle(image).objectPosition,
  );

  if (testInfo.project.name === 'desktop' || testInfo.project.name === 'tablet-768') {
    expect(objectPosition).toBe('50% 76%');
  }

  if (testInfo.project.name === 'mobile-320' || testInfo.project.name === 'mobile-390' || testInfo.project.name === 'no-js') {
    expect(objectPosition).toBe('100% 50%');
  }
});
```

- [ ] **Step 2: Run the focal-point contract to verify it fails**

Run:

```bash
cd /c/dev/julismo/.worktrees/fix-global-backdrop-hero-banner && npx playwright test tests/e2e/profile.spec.ts --project=desktop --project=mobile-390
```

Expected: desktop reports the previous centred crop rather than `50% 76%`.

- [ ] **Step 3: Apply the desktop-only CSS rule**

Insert the default desktop focal point before the existing mobile media query:

```css
.profile-hero__banner img {
  /* existing cover declarations */
  object-position: center 76%;
}

@media (max-width: 480px) {
  .profile-hero__banner img {
    object-position: right center;
  }
}
```

Do not alter banner height, veil, hairline, portrait, or any mobile rule.

- [ ] **Step 4: Run focal-point contracts to verify they pass**

Run the Step 2 command again.

Expected: desktop/tablet report `50% 76%`; mobile/no-JS report `100% 50%` and all existing layout assertions remain green.

- [ ] **Step 5: Run full validation and inspect both breakpoints**

Run:

```bash
cd /c/dev/julismo/.worktrees/fix-global-backdrop-hero-banner && npm test && npm run build
```

Expected: Astro check has zero diagnostics, all Vitest tests pass, all applicable Playwright tests pass with only intentional project skips, and the static Astro build succeeds.

Then use managed Playwright to capture 390 by 844 and 1440 by 900 pages. Inspect that the mobile crop is unchanged and the desktop stack text/icons are visibly inside the banner. Close the browser session after capture.

- [ ] **Step 6: Update progress and commit**

Append the completed plan and its commit range to `.superpowers/sdd/progress.md`, then run `git diff --check` and commit:

```bash
git add src/styles/global.css tests/e2e/profile.spec.ts .superpowers/sdd/progress.md
git commit -m "fix: reveal desktop technology stack in banner"
```

## Final review and integration

- [ ] Generate a fresh review package from `git merge-base main HEAD` through the final feature head, then conduct a whole-branch review with the original spec and this plan as the acceptance contract.
- [ ] Resolve any critical or important findings, rerun `npm test && npm run build`, and inspect the production candidate at 390 and 1440 widths.
- [ ] Fast-forward the approved feature into `development`, then `main`; push only the personal `julismo/julismo` repository and deploy through the personal `julismos-projects` Vercel scope.
- [ ] Verify `https://julismo.vercel.app/` serves the new Cal booking path, desktop crop, all static assets, and QR target before reporting completion.
