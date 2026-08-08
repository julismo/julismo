# Link Section Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the approved `SOLUÇÕES` and `PRESENÇA` group labels while preserving the contact-first link order and every destination.

**Architecture:** Extend the existing `ProfileLink.section` field instead of adding template-specific link IDs. `profile.ts` owns section semantics; `index.astro` maps those semantics to labels; Vitest and Playwright lock the data and rendered sequence.

**Tech Stack:** Astro 7, TypeScript, Vitest, Playwright.

## Global Constraints

- UI copy must be European Portuguese: `SOLUÇÕES` and `PRESENÇA`.
- Preserve all six links' order and destination.
- Keep WhatsApp, Cal.com, and Email unheaded in the contact block.
- ARM is the only `solutions` entry; GitHub and X are `presence` entries.
- Do not alter card CSS, visual icons, Cal.com, email, banner, QR, scroll, or motion behavior.

---

### Task 1: Lock the approved section contract and render it

**Files:**
- Modify: `tests/unit/profile.test.ts`
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `src/lib/profile.ts`
- Modify: `src/data/profile.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `ProfileLink.section` and existing `.link-section-label` / `[data-link-id]` hooks.
- Produces: `section: 'contact' | 'solutions' | 'presence'`, with labels immediately before the first relevant card.

- [ ] **Step 1: Write the failing unit expectation for section semantics.**

Replace the current ARM, GitHub, and X expected section entries in `tests/unit/profile.test.ts` with:

```ts
{ id: 'arm', title: 'ARM Solutions', description: 'IA e automação para PMEs', section: 'solutions' },
{ id: 'github', title: 'GitHub', description: 'Código e projetos open source', section: 'presence' },
{ id: 'x', title: 'X', description: 'Ideias e atualizações', section: 'presence' },
```

- [ ] **Step 2: Add the failing rendered-order E2E contract.**

Add this test to `tests/e2e/profile.spec.ts`:

```ts
test('groups business solutions and digital presence without interrupting contacts', async ({ page }) => {
  await page.goto('/');

  const sequence = await page.locator('.link-list > *').evaluateAll((items) =>
    items.map((item) =>
      item.classList.contains('link-section-label')
        ? `label:${item.textContent?.trim()}`
        : `link:${item.getAttribute('data-link-id')}`,
    ),
  );

  expect(sequence).toEqual([
    'link:whatsapp',
    'link:cal',
    'label:SOLUÇÕES',
    'link:arm',
    'link:email',
    'label:PRESENÇA',
    'link:github',
    'link:x',
  ]);
});
```

- [ ] **Step 3: Run the focused tests to prove red.**

```powershell
npm run test:unit -- tests/unit/profile.test.ts
$env:CI = '1'
npx playwright test tests/e2e/profile.spec.ts --project=desktop --grep "groups business solutions"
Remove-Item Env:CI
```

Expected: the unit test fails because `work`/`contact` remain; E2E fails because `PRESENÇA` is absent.

- [ ] **Step 4: Extend the section type and data.**

In `src/lib/profile.ts`, replace:

```ts
section: 'contact' | 'work';
```

with:

```ts
section: 'contact' | 'solutions' | 'presence';
```

In `src/data/profile.ts`, set ARM to `section: 'solutions'`; set GitHub and X to `section: 'presence'`.

- [ ] **Step 5: Render both labels from the section field.**

In `src/pages/index.astro`, add:

```ts
const sectionLabels = {
  solutions: 'SOLUÇÕES',
  presence: 'PRESENÇA',
} as const;
```

Replace the one-off condition in the link loop with:

```astro
{link.section in sectionLabels && (
  <span class="link-section-label">{sectionLabels[link.section as keyof typeof sectionLabels]}</span>
)}
```

- [ ] **Step 6: Run the focused tests to prove green.**

Run the Step 3 commands again. Expected: both pass.

- [ ] **Step 7: Run the full quality gate and build.**

```powershell
npm run check
npm run test:unit
$env:CI = '1'
npx playwright test --reporter=line
Remove-Item Env:CI
npm run build
git diff --check
```

Expected: Astro has zero diagnostics, all unit tests pass, Playwright passes apart from documented skips, the build succeeds, and the diff is clean.

- [ ] **Step 8: Commit only the hierarchy work.**

```powershell
git add src/lib/profile.ts src/data/profile.ts src/pages/index.astro tests/unit/profile.test.ts tests/e2e/profile.spec.ts docs/superpowers/plans/2026-08-08-link-section-hierarchy.md
git commit -m "feat: group profile links by purpose"
git status --short
```

## Plan self-review

- Spec coverage: the task implements approved naming, grouping, sequence, and non-regression constraints.
- Placeholder scan: no deferred work or undefined interfaces remain.
- Consistency: labels and order match the design document, unit expectation, E2E expectation, and render map.
