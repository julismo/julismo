# Desktop card rhythm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar à pilha desktop do perfil o mesmo ritmo de 8 px entre cartões usado no mobile.

**Architecture:** Alterar apenas a sobreposição CSS desktop e proteger o comportamento com uma asserção geométrica Playwright a 1440 por 900.

**Tech Stack:** Astro, CSS, Playwright.

## Restrições globais

- O mobile mantém 8 px.
- O desktop, a partir de 768 px, passa de 4 px para 8 px.
- Mantêm-se altura mínima de 66 px, ordem, largura e centro dos cartões, margens dos rótulos de secção, ausência de overflow horizontal e ausência de scrollbar personalizada.
- Não há alteração de dependências nem da estrutura DOM.

---

### Task 1: Unificar a cadência da lista desktop

**Files:**

- Modify: `src/styles/global.css`
- Modify: `tests/e2e/profile.spec.ts`

- [x] **Step 1: Escrever o teste que descreve 8 px reais no desktop.**

  ```ts
  expect(rhythm.rowGap).toBe('8px');
  expect(rhythm.firstToSecond).toBeCloseTo(8, 1);
  expect(rhythm.secondToThird).toBeCloseTo(8, 1);
  ```

- [x] **Step 2: Correr o teste focado e confirmar RED com os 4 px actuais.**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop -g "eight-pixel card rhythm"`
  Expected: FAIL, `Expected: "8px"`, `Received: "4px"`.

- [x] **Step 3: Alteração mínima.**

  Em `@media (min-width: 768px)`, substituir `gap: 4px` por `gap: 8px` em `.link-list`.

- [x] **Step 4: Confirmar GREEN e regressões.**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=desktop -g "eight-pixel card rhythm"`
  Expected: PASS, confirmando os dois intervalos reais, altura desktop e ausência de overflow horizontal.

- [x] **Step 5: Validar a suite e a build.**

  Run: `npm test && npm run build`
  Expected: exit 0, sem diagnósticos Astro.
