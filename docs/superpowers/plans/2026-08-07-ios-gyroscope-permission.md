# iOS Gyroscope Permission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the existing bounded gyroscope profile motion on iPhone Safari after its required one-time permission gesture.

**Architecture:** `ProfileHero.astro` provides an initially hidden permission action. `motion.ts` owns progressive enhancement state: it keeps Android automatic, requests Safari permission directly from that action, and only then installs the existing calibrated orientation listener. Playwright simulates the Safari API to pin the browser contract.

**Tech Stack:** Astro 7, TypeScript, CSS custom properties, Playwright.

## Global Constraints

- Do not add a motion preference setting or sensor prompt on browsers that do not require it.
- Keep `prefers-reduced-motion: reduce` fully static.
- Keep motion bounded by the existing `MOTION_LIMITS` implementation.
- Use PT-PT copy: `Ativar movimento`.
- Do not change contact links, Cal integration, QR assets, or card ordering in this PR.

---

### Task 1: Pin Safari permission and orientation behaviour

**Files:**

- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**

- Consumes: `data-motion` on `<html>`, `[data-motion-consent]`, and `[data-profile-plane]`.
- Produces: a regression contract for the permission-required, active, and reduced states.

- [ ] **Step 1: Write the failing test**

Add a `mobile-390` test that injects a `DeviceOrientationEvent` class with `requestPermission: async () => 'granted'` before `page.goto('/')`. Assert `data-motion="permission-required"`, click a button named `Ativar movimento`, assert `data-motion="active"`, dispatch baseline `{ beta: 0, gamma: 0 }` and moved `{ beta: 24, gamma: 18 }` orientation events, then poll `[data-profile-plane]` until its inline `--tilt-x` value is not `0deg`.

- [ ] **Step 2: Run it to verify RED**

Run:

```powershell
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 -g "enables bounded orientation motion after Safari grants permission"
```

Expected: FAIL because the current script sets `data-motion="static"` and no `Ativar movimento` action exists.

- [ ] **Step 3: Write the minimal implementation**

Add this initially hidden action after the bio in `src/components/ProfileHero.astro`:

```astro
<button class="motion-consent" type="button" data-motion-consent hidden>
  Ativar movimento
</button>
```

Refactor `src/scripts/motion.ts` so `startMotion()` owns the existing listener setup. If `requestPermission` exists, set `root.dataset.motion = 'permission-required'`, unhide the button, call `requestPermission()` directly inside its click handler, then either call `startMotion()` after a `granted` result or hide the button and set `data-motion="denied"` on any other result. Keep the no-permission branch calling `startMotion()` immediately.

Add a compact `.motion-consent` rule in `src/styles/global.css` that matches the existing dark/silver language.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run the command from Step 2. Expected: PASS; the test observes `permission-required`, `active`, and a non-zero tilt after the second sample.

- [ ] **Step 5: Verify reduced motion and commit**

Run the existing reduced-motion test for `mobile-390`, then commit only `src/components/ProfileHero.astro`, `src/scripts/motion.ts`, `src/styles/global.css`, and `tests/e2e/profile.spec.ts` with message `fix: request iOS gyroscope permission`.

### Task 2: Verify and integrate the focused fix

**Files:**

- Verify: `src/components/ProfileHero.astro`, `src/scripts/motion.ts`, `src/styles/global.css`, `tests/e2e/profile.spec.ts`

**Interfaces:**

- Consumes: Task 1 regression contract.
- Produces: a verified PR scoped to iOS gyroscope permission.

- [ ] **Step 1: Run the full quality gate**

Run `npm test && npm run build` from this worktree, followed by `git diff --check origin/main...HEAD`. Expected: Astro diagnostics clean, unit tests pass, Playwright passes with only intentional skips, and production build succeeds.

- [ ] **Step 2: Inspect the Safari-simulated visual state**

Use Playwright at 390 by 844 to capture the permission-required state and the post-grant state. Confirm the action sits under the bio, cards retain their size/order, and there is no horizontal overflow.

- [ ] **Step 3: Publish via the requested GitHub flow**

Push `fix/ios-gyro-permission`, open a draft PR against `main`, obtain an independent review, and merge only when clean. The user explicitly requested this PR land in `main` so the production domain is ready for a physical iPhone test.
