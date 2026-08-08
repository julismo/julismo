# Link section hierarchy task 1 report

## TDD RED evidence

- Unit RED: `npm run test:unit -- tests/unit/profile.test.ts`
  - Result: 1 failed, 3 passed.
  - Expected/observed cause: `arm` was still `work`; `github` and `x` were still `contact`.
- Focused E2E RED:
  - First Playwright CI-mode attempts were blocked by a transient `webServer` startup issue in this harness.
  - The focused browser contract was then proven against a verified local Astro server.
  - Result: 1 failed.
  - Expected/observed cause: duplicate `label:PRESENÇA` rendered before both `github` and `x`.

## Implementation summary

- Updated `ProfileLink.section` from `'contact' | 'work'` to `'contact' | 'solutions' | 'presence'`.
- Moved `arm` to `solutions`, and `github`/`x` to `presence`.
- Replaced the one-off solutions label render with a section-label map for `solutions` and `presence`.
- Render labels only before the first card in each labeled section.
- Added/updated contracts in unit and focused E2E tests for the approved section hierarchy.
- Updated `LinkCard.astro` so the existing work-card styling follows the renamed `solutions` section.
- Added one synchronization line to the new E2E test (`toHaveCount(8)`) so the contract reads the settled Astro DOM reliably after navigation.

## Verification summary

- `npm run test:unit -- tests/unit/profile.test.ts`
  - Final result: 1 file passed, 4 tests passed.
- Focused E2E: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "groups business solutions" --reporter=line`
  - Final result: 1 passed.
- `npm run check`
  - Final result: 0 errors, 0 warnings, 0 hints.
- `npm run test:unit`
  - Final result: 4 files passed, 13 tests passed.
- `npx playwright test --reporter=line`
  - Final result: 53 passed, 41 skipped, 1 failed.
  - Failing test: `[desktop] keeps the desktop banner legible and the solutions hierarchy contained`
  - Failure detail: `scrollHeight` was `926`, expected `<= 900`.
- `npm run build`
  - Final result: build succeeded, 1 page built.
- `git diff --check`
  - Final result: no diff errors; Git only reported LF→CRLF working-copy warnings.

## Changed files

- `src/components/LinkCard.astro`
- `src/data/profile.ts`
- `src/lib/profile.ts`
- `src/pages/index.astro`
- `tests/e2e/profile.spec.ts`
- `tests/unit/profile.test.ts`

## Concerns

- Full Playwright verification is not green yet because the new second label increases desktop page height enough to fail the existing no-scroll desktop composition test.
- `src/components/LinkCard.astro` had to be updated even though it was not listed in the brief, because the renamed section type otherwise broke Astro type-checking and the existing ARM styling hook.

## Commit SHA

- `fcc0ba05a95c8e469d8b393f79a64b9e4b07c303`

---

## Task 2 desktop spacing fix report

### TDD RED evidence

- Focused desktop RED: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "keeps the desktop banner legible and the solutions hierarchy contained" --reporter=list`
  - Result: 1 failed.
  - Expected/observed cause: `scrollHeight` was `926`, expected `<= 900`.
- First minimal CSS attempt check:
  - Result: same focused test still failed with `scrollHeight` `922`.
  - Cause: the initial desktop list-spacing override was placed before later base rules, so it did not win in the cascade for `.link-list` and `.link-section-label`.

### Implementation summary

- Kept the fix CSS-only and desktop-only in `src/styles/global.css`.
- Reduced desktop bottom padding on `.page-shell` from `10px` to `2px`.
- Reduced desktop `.link-list` gap from `8px` to `4px`.
- Tightened desktop `.link-section-label` vertical margins from `6px 0 -1px 58px` to `2px 0 -3px 58px`.
- Reduced desktop `.page-divider` margins from `17px 0 12px` to `14px 0 10px`.
- Placed the desktop divider override after the base divider rule so the cascade applies the intended desktop spacing.

### GREEN evidence

- Focused desktop GREEN: `npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "keeps the desktop banner legible and the solutions hierarchy contained|groups business solutions" --reporter=list`
  - Final result: 2 passed.

### Layout measurements

- Desktop viewport used for verification: `1440x900`.
- Final measured CSS values:
  - `.page-shell` `padding-bottom`: `2px`
  - `.link-list` `gap`: `4px`
  - `.link-section-label` margins: `2px 0 -3px 58px`
  - `.page-divider` margins: `14px 0 10px`
- Final geometry probe against the verified local Astro server:
  - `document.documentElement.scrollHeight`: `900`
  - `.page-shell` bottom edge: `873.40625`
  - `.page-footer` bottom edge: `871.40625`
  - `.page-divider` top/bottom: `846.40625` / `847.40625`
- Interpretation: the document still reports a viewport-tall `scrollHeight` of `900`, but the actual composed shell content ends about `26.6px` above the viewport bottom, so the no-scroll desktop contract has real layout headroom.

### Full verification summary

- `npm run check`
  - Final result: 0 errors, 0 warnings, 0 hints.
- `npm run test:unit`
  - Final result: 4 files passed, 13 tests passed.
- `npx playwright test --reporter=line`
  - Final result: 54 passed, 41 skipped, 0 failed.
- `npm run build`
  - Final result: build succeeded, 1 page built.
- `git diff --check`
  - Final result: no diff errors; Git only reported LF→CRLF working-copy warnings for `src/styles/global.css`.

### Changed files

- `src/styles/global.css`
- `.superpowers/sdd/link-section-hierarchy-task-1-report.md`

### Concerns

- No product-behaviour concerns. The only notable detail is that `scrollHeight` remains exactly viewport-tall (`900`) because the document is at least viewport height, so the stronger evidence for slack is the measured shell/footer geometry above the fold.

### Commit SHA

- Pending at report-write time; filled in after commit below.
