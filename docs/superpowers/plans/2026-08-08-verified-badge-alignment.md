# Verified Badge Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach the verification seal to the centred `Julismo` heading with a consistent 6 px gap at mobile and desktop widths.

**Architecture:** Keep the existing Astro markup and seal asset. The CSS name-row becomes intrinsically sized so the absolutely positioned seal is measured from the heading rather than from the viewport; Playwright checks the rendered geometry.

**Tech Stack:** Astro 7, CSS, Playwright.

## Global Constraints

- `Julismo` remains centred independently from the verification seal.
- The seal stays decorative with `alt=""` and `aria-hidden="true"`.
- The visible gap from heading to seal is 6 px, with sub-pixel rendering tolerance.
- Preserve the 21 px seal asset, portrait, banner, bio, card layout, motion, links, and QR assets.

---

### Task 1: Anchor and verify the compact verification seal

**Files:**

- Modify: `tests/e2e/profile.spec.ts:419-436`
- Modify: `src/styles/global.css:159-184`
- Create: `docs/superpowers/specs/2026-08-08-verified-badge-alignment-design.md`
- Create: `docs/superpowers/plans/2026-08-08-verified-badge-alignment.md`

**Interfaces:**

- Consumes: `.profile-hero__name-row`, `.profile-hero h1`, and `.verified-rosette`.
- Produces: a 6 px badge gap while the heading centre equals the viewport centre.

- [ ] **Step 1: Write the failing rendered-geometry contract.**

Replace the current mobile-only guard with mobile-or-desktop coverage and collect the badge gap and vertical alignment:

```ts
test.skip(
  !['mobile-390', 'desktop'].includes(testInfo.project.name),
  'The badge alignment is calibrated at the primary mobile and desktop viewports.',
);

return {
  headingCenter: heading.left + heading.width / 2,
  viewportCenter: window.innerWidth / 2,
  badgeGap: badge.left - heading.right,
  verticalDelta: Math.abs(
    badge.top + badge.height / 2 - (heading.top + heading.height / 2),
  ),
};

expect(geometry.badgeGap).toBeGreaterThanOrEqual(5.5);
expect(geometry.badgeGap).toBeLessThanOrEqual(6.5);
expect(geometry.verticalDelta).toBeLessThanOrEqual(1);
```

- [ ] **Step 2: Run the focused test to verify it fails.**

Run `npx playwright test --project=mobile-390 --project=desktop -g "keeps the verification seal closely aligned" --reporter=list`.

Expected: failure because the existing viewport-derived placement produces an approximately 10 px gap.

- [ ] **Step 3: Write the minimal CSS implementation.**

Change the name-row and seal rules to:

```css
.profile-hero__name-row {
  width: fit-content;
}

.verified-rosette {
  left: calc(100% + 6px);
}
```

- [ ] **Step 4: Run the focused test to verify it passes.**

Run `npx playwright test --project=mobile-390 --project=desktop -g "keeps the verification seal closely aligned" --reporter=list`.

Expected: two passing projects, with the heading centred and a 6 px seal gap.

- [ ] **Step 5: Run the full verification gate.**

Run `npm test`, `npm run build`, and `git diff --check`.

Expected: Astro check has 0 diagnostics, Vitest has 13 passing tests, Playwright has no failures, build exits 0, and the diff check is clean.

- [ ] **Step 6: Commit the scoped change.**

Run `git add docs/superpowers/specs/2026-08-08-verified-badge-alignment-design.md docs/superpowers/plans/2026-08-08-verified-badge-alignment.md src/styles/global.css tests/e2e/profile.spec.ts` then `git commit -m "fix: tighten verified badge alignment"`.
