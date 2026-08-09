# Visible Mobile Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the iPhone tilt effect visibly move the card list and report a no-sensor Safari failure instead of appearing inert.

**Architecture:** `index.astro` assigns the motion plane to the contact navigation. `motion.ts` continues to supply calibrated CSS custom properties but adds a Safari first-sample watchdog. `global.css` makes the link list the transformed layer; `motion.ts` keeps all permission logic. Playwright mocks Safari sensors and verifies observable geometry and the unavailable state.

**Tech Stack:** Astro 7, TypeScript, CSS transforms/custom properties, Playwright, Vitest.

## Global Constraints

- Keep PT-PT copy and the existing contact-card order/destinations.
- Do not add a dependency or a user setting.
- Respect `prefers-reduced-motion: reduce` with no motion or permission action.
- Do not allow transformed cards to create horizontal overflow at 320 px or 390 px.
- Only merge after a fresh full test suite, build, visual check, review, PR, and production smoke test.

---

### Task 1: Pin visible card motion and no-sensor feedback

**Files:**

- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**

- Consumes: `[data-profile-plane]`, `.profile-hero`, `[data-link-id="whatsapp"]`, `[data-motion-consent]`, `[data-motion-status]`, and `html[data-motion]`.
- Produces: browser contracts for visibly moving cards and the Safari no-event failure path.

- [ ] **Step 1: Write failing Playwright contracts**

Add a `mobile-390` test that mocks granted Safari permissions, records the hero and WhatsApp-card rectangles, clicks `Ativar movimento`, dispatches `{ beta: 0, gamma: 0 }` then twelve `{ beta: 0, gamma: 20 }` orientation events, and polls until the card plane has `--shift-x >= 5px`. Assert that the WhatsApp card moved right by at least 5 px while the hero left edge changed by at most 1 px.

Add a second granted-Safari test that dispatches no sensor event. Poll until `html[data-motion="unavailable"]`, then require a visible disabled `[data-motion-consent]` named `Movimento indisponível` and an accessible status containing `Abra esta página diretamente no Safari`.

- [ ] **Step 2: Run RED**

Run `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --workers=1 --grep "moves the card plane visibly|reports unavailable motion"`.

Expected: both tests fail. The old plane moves the hero too, never reaches a 5 px shift, and stays `waiting` forever when no event arrives.

### Task 2: Implement the bounded, observable motion plane

**Files:**

- Modify: `src/pages/index.astro`
- Modify: `src/lib/motion.ts`
- Modify: `src/scripts/motion.ts`
- Modify: `src/styles/global.css`

**Interfaces:**

- Consumes: the Task 1 data-attribute and visible-result contracts.
- Produces: `data-motion="active"` after a real sample, `data-motion="unavailable"` after a two-second Safari no-event timeout, and CSS variables on `.link-list[data-profile-plane]`.

- [ ] **Step 1: Assign the motion plane to the cards**

Change `src/pages/index.astro` so `<main class="page-shell">` has no `data-profile-plane` attribute and `<nav class="link-list" ...>` has it. In `src/styles/global.css`, remove transform and `will-change` from `.page-shell`; add the existing perspective/translation/rotation transform to `.link-list[data-profile-plane]`; and update the reduced-motion selector to target `[data-profile-plane]`.

- [ ] **Step 2: Make a sustained tilt visible without exceeding mobile gutters**

In `src/lib/motion.ts`, keep the dead zone at `0.8` and set the motion limits to `maxRotation: 1.75`, `maxTranslation: 8`, and `smoothing: 0.18`. Convert deltas using `rotateX = clamp(-betaDelta / 12, maxRotation)` and `rotateY = clamp(gammaDelta / 10, maxRotation)`, then map each rotation to translation with a multiplier of `4` before the 8 px clamp.

- [ ] **Step 3: Surface Safari no-event failure**

In `src/scripts/motion.ts`, let `activateMotion` create a two-second timeout only for the permission-gated Safari path. Set the consent text to `Mova o telemóvel…` before starting listeners. Clear the timeout on the first valid sample. If it expires while still waiting, set `root.dataset.motion = 'unavailable'`, keep the consent visible and disabled as `Movimento indisponível`, and set the status text to `Não foi possível detetar movimento. Abra esta página diretamente no Safari e experimente novamente.`. Keep granted, denied, fallback, focus restoration, and reduced-motion branches intact.

- [ ] **Step 4: Run GREEN**

Run the exact Task 1 command. Expected: both added tests pass; the old grant/fallback/denial/reduced-motion contracts remain compatible.

### Task 3: Verify, review, publish, and merge

**Files:**

- Verify: `src/pages/index.astro`, `src/lib/motion.ts`, `src/scripts/motion.ts`, `src/styles/global.css`, `tests/e2e/profile.spec.ts`

**Interfaces:**

- Consumes: the Task 1 and Task 2 contracts.
- Produces: a reviewed PR merged to `main` and a production URL ready for physical iPhone validation.

- [ ] **Step 1: Run full quality gate**

Run `npm test`, `npm run build`, and `git diff --check origin/main...HEAD`.

Expected: Astro reports 0 diagnostics; Vitest and Playwright pass with only existing intentional skips; build succeeds; diff check is clean.

- [ ] **Step 2: Inspect visual output**

At 390 by 844, capture baseline and sustained-tilt images with mocked Safari events. Verify the hero stays aligned, the card list shifts within side gutters, no horizontal scrollbar appears, and the no-event outcome visibly says `Movimento indisponível`.

- [ ] **Step 3: Commit and publish**

Commit the documentation and source/test changes with a concise fix message, push `fix/visible-mobile-motion`, open a PR against `main`, obtain review, merge it, pull `main`, and run a production smoke check at `https://julismo.vercel.app/`.
