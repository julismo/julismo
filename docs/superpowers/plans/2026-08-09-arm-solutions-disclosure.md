# ARM Solutions Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the ARM external action card with an accessible native disclosure that shows three ICP-led solutions and preserves the ARM website link inside it.

**Architecture:** The profile data module owns the public ARM copy and solution list. A focused SolutionDisclosure component renders native details semantics for the ARM row, while the index page selects it from the existing link list. Global CSS extends the established card system without adding JavaScript or dependencies.

**Tech Stack:** Astro 7, TypeScript, CSS, Vitest, Playwright.

## Global Constraints

- Use European Portuguese copy exactly as approved in the design.
- Preserve WhatsApp, Cal.com, Email, LinkedIn and GitHub ordering and destinations.
- Preserve https://arm-lda.com/ as an external link inside the disclosure.
- Keep the disclosure closed by default and working with JavaScript disabled.
- Do not add dependencies or a JavaScript module.
- No horizontal overflow at 280px, 320px, 390px, tablet or desktop.
- Respect prefers-reduced-motion.
- At desktop 1440 by 900, leave at least 32px of black background after the GitHub card.

---

### Task 1: Lock the data and disclosure behaviour before implementation

**Files:**

- Modify: tests/unit/profile.test.ts
- Modify: tests/e2e/profile.spec.ts

**Interfaces:**

- Consumes existing profile links, data-link-id, link-list and card CSS hooks.
- Produces tests for revised ARM copy, collapsed-by-default state, native expansion, solution copy, preserved external URL and keyboard order.

- [ ] **Step 1: Write a failing unit expectation for the revised ARM copy.**

Replace the ARM hierarchy entry with:

~~~ts
{
  id: 'arm',
  title: 'ARM Solutions',
  description: 'Para distribuição, transportes e logística',
  section: 'solutions',
}
~~~

- [ ] **Step 2: Add a failing E2E contract for progressive disclosure.**

~~~ts
test('reveals ARM entry solutions progressively and keeps its website available', async ({ page }) => {
  await page.goto('/');

  const disclosure = page.locator('[data-solutions-disclosure]');
  const summary = disclosure.locator('summary');
  await expect(disclosure).toHaveCount(1);
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('data-arm-summary', '');
  await expect(summary.getByText('Para distribuição, transportes e logística')).toBeVisible();

  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.locator('[data-solution-id]')).toHaveCount(3);
  await expect(disclosure.getByText('Orçamentos que chegam a tempo')).toBeVisible();
  await expect(disclosure.getByText('Documentos prontos a faturar')).toBeVisible();
  await expect(disclosure.getByText('Operação sob controlo')).toBeVisible();

  const armSite = disclosure.locator('[data-arm-site]');
  await expect(armSite).toHaveAttribute('href', 'https://arm-lda.com/');
  await expect(armSite).toHaveAttribute('target', '_blank');
  await expect(armSite).toHaveAttribute('rel', 'noopener noreferrer');
});
~~~

- [ ] **Step 3: Run the focused tests to prove RED.**

~~~powershell
npm run test:unit -- tests/unit/profile.test.ts
$env:CI = '1'
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "reveals ARM entry solutions"
Remove-Item Env:CI
~~~

Expected: the unit expectation reports the old ARM description and Playwright cannot find data-solutions-disclosure.

### Task 2: Render the native ARM disclosure

**Files:**

- Create: src/components/SolutionDisclosure.astro
- Modify: src/data/profile.ts
- Modify: src/pages/index.astro
- Modify: tests/unit/profile.test.ts
- Modify: tests/e2e/profile.spec.ts

**Interfaces:**

- Consumes ProfileLink, BrandIcon, the ARM href and armSolutions.
- Produces a details node with data-link-id arm, a summary data-arm-summary, three data-solution-id entries and a data-arm-site link.

- [ ] **Step 1: Define solution data in the profile data module.**

~~~ts
export const armSolutions = [
  {
    id: 'quotes',
    title: 'Orçamentos que chegam a tempo',
    description: 'Respostas rápidas, com margem protegida.',
  },
  {
    id: 'documents',
    title: 'Documentos prontos a faturar',
    description: 'Guias, CMR e POD organizados antes de bloquearem faturação.',
  },
  {
    id: 'operations',
    title: 'Operação sob controlo',
    description: 'Prioridades, atrasos e pendências visíveis antes de virarem problemas.',
  },
] as const;
~~~

Set ARM description to Para distribuição, transportes e logística.

- [ ] **Step 2: Implement SolutionDisclosure.astro with native semantics.**

~~~astro
<details class="solution-disclosure" data-solutions-disclosure data-link-id={link.id}>
  <summary class="link-card link-card--work" data-arm-summary>
    <!-- existing ARM icon and copy -->
    <!-- rounded chevron action, aria-hidden -->
  </summary>
  <div class="solution-disclosure__panel">
    <ul class="solution-disclosure__list" aria-label="Soluções ARM">
      {solutions.map((solution) => (
        <li class="solution-disclosure__item" data-solution-id={solution.id}>
          <strong>{solution.title}</strong>
          <span>{solution.description}</span>
        </li>
      ))}
    </ul>
    <a class="solution-disclosure__site-link" data-arm-site href={link.href} target="_blank" rel="noopener noreferrer">
      Conhecer a ARM Solutions
    </a>
  </div>
</details>
~~~

- [ ] **Step 3: Use the component only for the ARM link.**

~~~astro
{link.id === 'arm' ? (
  <SolutionDisclosure link={link} solutions={armSolutions} />
) : (
  <LinkCard link={link} />
)}
~~~

- [ ] **Step 4: Extend the data and destination tests.**

Assert all three armSolutions entries in profile.test.ts. Update the E2E destination check so the ARM URL is asserted through data-arm-site after opening the disclosure, while the five direct action links remain unchanged.

- [ ] **Step 5: Run focused tests to prove GREEN.**

Run the Task 1 commands again. Expected: both pass.

### Task 3: Style and validate the compact mobile disclosure

**Files:**

- Modify: src/styles/global.css
- Modify: tests/e2e/profile.spec.ts

**Interfaces:**

- Consumes link-card, radius-card, existing focus, hover and reduced-motion styles.
- Produces a chevron that rotates on open, three compact nested solution items, an ARM site link and no overflow.

- [ ] **Step 1: Add failing E2E geometry, keyboard-order and desktop-breathing-room assertions.**

After opening the disclosure on mobile-390, assert no horizontal overflow, each solution item remains within the disclosure horizontal bounds, and Tab moves from summary to data-arm-site and then LinkedIn. In a desktop-only test at 1440 by 900, assert there are at least 32px between the GitHub card bottom and the document end.

- [ ] **Step 2: Add scoped CSS for the disclosure.**

~~~css
.solution-disclosure { display: grid; gap: 8px; }
.solution-disclosure > summary { cursor: pointer; list-style: none; }
.solution-disclosure > summary::-webkit-details-marker { display: none; }
.solution-disclosure[open] .link-card__action-icon { transform: rotate(180deg); }
.solution-disclosure__panel { display: grid; gap: 8px; padding: 0 4px 2px; }
.solution-disclosure__list { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
~~~

Use the existing dark palette and transitions only inside the no-preference media query. Increase the desktop page-shell bottom padding to preserve the 32px black background breathing room after GitHub.

- [ ] **Step 3: Run the new focused browser test to prove GREEN.**

~~~powershell
$env:CI = '1'
npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 --grep "keeps expanded ARM solutions"
Remove-Item Env:CI
~~~

Expected: the nested items fit within safe horizontal bounds and keyboard order remains logical.

- [ ] **Step 4: Inspect the implementation in the browser.**

Capture local screenshots at 390 by 844 and 1440 by 900 in open and closed states. Verify the closed profile remains compact, expansion reads as a deliberate continuation of ARM, and the chevron has no square or dominant treatment.

- [ ] **Step 5: Run the complete quality gate.**

~~~powershell
npm test
npm run build
git diff --check
~~~

Expected: Astro check has zero diagnostics, all unit tests pass, Playwright has no unexpected failures, build succeeds and the diff is clean.

- [ ] **Step 6: Commit the isolated feature.**

~~~powershell
git add src/components/SolutionDisclosure.astro src/data/profile.ts src/pages/index.astro src/styles/global.css tests/unit/profile.test.ts tests/e2e/profile.spec.ts docs/superpowers/specs/2026-08-09-arm-solutions-disclosure-design.md docs/superpowers/plans/2026-08-09-arm-solutions-disclosure.md
git commit -m "feat: disclose ARM entry solutions"
git status --short
~~~

## Plan self-review

- Spec coverage: data, native disclosure semantics, ICP-approved copy, existing ARM site preservation, keyboard flow, responsive geometry, motion preference and regression testing are covered.
- Placeholder scan: every implementation step defines concrete files, selectors, copy and verification commands.
- Consistency: data IDs, selectors and copy match the design document, tests and component contract.
