# Task 1 Report: Regression Test

## Files changed

- `tests/e2e/profile.spec.ts`
  - Changed the existing `.link-card` minimum-height assertion from `58px` to `66px`.
  - Added `keeps a global illuminated backdrop and a scaled decorative hero banner`.
  - The new test checks `body::before` for `position: fixed` and a `radial-gradient`, and checks the hero image `src`, empty `alt`, and 66 px card minimum height.

## RED verification

Command:

```text
npx playwright test tests/e2e/profile.spec.ts --grep "global illuminated backdrop"
```

Observed result: 5 tests failed (desktop, tablet-768, mobile-390, mobile-320, and no-js). The first failing assertion in every project was:

```text
Error: expect(received).toContain(expected) // indexOf
Expected substring: "radial-gradient"
Received string:    "none"
```

This is the expected RED state: the current production page does not yet provide the required illuminated `body::before` backdrop, so the test stops before the banner assertions. No production CSS, markup, or assets were changed.

## Commit

`30a12a7c91ec659b6b88863cdb125b180f7b4b67` (`test: add backdrop and hero banner regression contract`)

## Self-review

- Change is limited to the specified Playwright test file.
- Assertions match the exact values in `task-1-brief.md`.
- The focused test was run before and after commit and failed for the expected missing-feature reason.
- Existing unrelated untracked planning files were preserved and not included in the commit.

## Concerns

- The focused test intentionally remains RED until a later task adds the backdrop and hero banner production implementation.
- The worktree contains pre-existing untracked files under `docs/superpowers/plans/` and `docs/superpowers/specs/`; they are unrelated and were left untouched.
