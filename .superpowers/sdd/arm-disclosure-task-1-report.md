# ARM Solutions disclosure — Task 1 report

## Scope

- Updated the unit microcopy expectation for the ARM hierarchy entry to `Para distribuição, transportes e logística`.
- Added the focused Playwright contract for closed-by-default native disclosure, keyboard expansion, three solution entries, ARM website destination, and secure external-link attributes.
- No production source, styles, dependencies, modules, or project documentation were changed.

## RED evidence

Focused unit command:

```text
npm run test:unit -- tests/unit/profile.test.ts
FAIL — 1 failed, 3 passed
Expected: Para distribuição, transportes e logística
Received: IA e automação para PMEs
```

Focused E2E command requested by the brief:

```text
$env:CI = '1'; npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions"; Remove-Item Env:CI
```

Result: could not start because `http://127.0.0.1:4321` was already in use and CI disables Playwright's existing-server reuse.

The same focused Playwright test was then run without CI against the existing server:

```text
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions"
FAIL — expected 1 `[data-solutions-disclosure]`, received 0
```

## Self-review

The diff is test-only plus this report. Existing unrelated changes in `.superpowers/sdd/progress.md` were preserved. The tests remain intentionally RED pending the implementation task.

## Reviewer follow-up RED evidence

Updated the grouping contract to require the ARM row as a direct-child `details[data-solutions-disclosure][data-link-id="arm"]`, use `summary[data-arm-summary]` for the closed-state keyboard stop, and reject a direct-child ARM anchor. The progressive disclosure test now uses explicit `details` and direct-child `summary` selectors.

Added focused mobile browser contracts for expanded-solution horizontal bounds and reduced-motion chevron/panel state.

Focused unit command:

```text
npm run test:unit -- tests/unit/profile.test.ts
FAIL — 1 failed, 3 passed
Expected: Para distribuição, transportes e logística
Received: IA e automação para PMEs
```

Focused browser commands (run without `CI` because port 4321 already had a reusable dev server):

```text
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "groups business solutions" --reporter=list
FAIL — expected disclosure:arm, received link:arm

npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions" --reporter=list
FAIL — expected 1 details[data-solutions-disclosure][data-link-id="arm"], received 0

npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "keeps expanded ARM solutions" --reporter=list
FAIL — expected 1 details[data-solutions-disclosure][data-link-id="arm"], received 0

npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "keeps the ARM disclosure action" --reporter=list
FAIL — expected 1 details[data-solutions-disclosure][data-link-id="arm"], received 0
```

The follow-up remains test-only; no production source, CSS, or project docs were changed.
