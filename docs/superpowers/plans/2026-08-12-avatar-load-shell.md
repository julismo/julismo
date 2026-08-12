# Avatar Load Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evitar que as linhas do banner atravessem o círculo do retrato antes de a fotografia estar desenhada, sem atrasar nem alterar a identidade do perfil.

**Architecture:** A imagem existente mantém-se como o único elemento visual do avatar. Uma cor de fundo opaca no próprio `img` cria a superfície estável desde o primeiro desenho; um preload declarativo no layout inicia a transferência antes do conteúdo principal. A prova de regressão suspende deliberadamente a resposta da fotografia e mede o estado real do browser antes e depois de a libertar.

**Tech Stack:** Astro, CSS, Playwright.

## Global Constraints

- A base da `.profile-hero__image` é exactamente `var(--color-bg)` (`#0a0a0b`) e permanece circular.
- O anel e a sombra existentes mantêm-se; não se altera a fotografia, o banner, a composição, dimensões, acessibilidade ou animações.
- O `<head>` inclui exactamente um preload para `/images/julismo-profile.png` com `rel="preload"` e `as="image"`.
- O retrato continua com `loading="eager"`, `decoding="async"`, dimensões 156 por 156 e `alt="Retrato profissional de Julismo"`.
- Antes de a fotografia chegar, a base opaca aparece; depois de a resposta ser libertada, a imagem completa carrega normalmente.
- Sem dependências novas ou alteração de estrutura DOM.

---

### Task 1: Tornar o avatar estável durante o primeiro desenho

**Files:**

- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/profile.spec.ts`
- Modify: `docs/superpowers/specs/2026-08-12-avatar-load-shell-design.md`
- Modify: `docs/superpowers/plans/2026-08-12-avatar-load-shell.md`

**Interfaces:**

- Consumes: `profile.image` (`'/images/julismo-profile.png'`) em `BaseLayout.astro` e a classe `.profile-hero__image` em `ProfileHero.astro`.
- Produces: um preload estático no `<head>` e uma imagem cujo `getComputedStyle(...).backgroundColor` é `rgb(10, 10, 11)` antes de o recurso estar disponível.

- [x] **Step 1: Escrever o teste de regressão de carregamento bloqueado.**

  Em `tests/e2e/profile.spec.ts`, a seguir ao teste de composição do banner, adicionar:

  ```ts
  test('keeps an opaque avatar shell while the portrait is loading', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'The avatar loading state is calibrated at the primary mobile viewport.');

    let releasePortrait!: () => void;
    const portraitGate = new Promise<void>((resolve) => {
      releasePortrait = resolve;
    });

    await page.route('**/images/julismo-profile.png', async (route) => {
      await portraitGate;
      await route.continue();
    });

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const portrait = page.locator('.profile-hero__image');
      const shell = await portrait.evaluate((image) => ({
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        backgroundColor: getComputedStyle(image).backgroundColor,
        borderRadius: getComputedStyle(image).borderRadius,
      }));

      expect(shell.complete).toBe(false);
      expect(shell.naturalWidth).toBe(0);
      expect(shell.backgroundColor).toBe('rgb(10, 10, 11)');
      expect(shell.borderRadius).toBe('50%');
      await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1);
      await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveAttribute(
        'href',
        '/images/julismo-profile.png',
      );
      await expect(portrait).toHaveAttribute('loading', 'eager');
      await expect(portrait).toHaveAttribute('decoding', 'async');
      await expect(portrait).toHaveAttribute('width', '156');
      await expect(portrait).toHaveAttribute('height', '156');
      await expect(portrait).toHaveAttribute('alt', 'Retrato profissional de Julismo');

      releasePortrait();
      await expect.poll(() => portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    } finally {
      releasePortrait();
    }
  });
  ```

- [x] **Step 2: Correr o teste focalizado e confirmar RED.**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 -g "opaque avatar shell"`

  Expected: FAIL em `backgroundColor`; o estado actual é `rgba(0, 0, 0, 0)` porque a fotografia não tem fundo CSS próprio.

- [x] **Step 3: Implementar a alteração mínima.**

  Em `src/layouts/BaseLayout.astro`, imediatamente antes do canonical, adicionar:

  ```astro
  <link rel="preload" as="image" href={profile.image} />
  ```

  Em `src/styles/global.css`, dentro de `.profile-hero__image`, imediatamente antes de `border`, adicionar:

  ```css
  background: var(--color-bg);
  ```

- [x] **Step 4: Correr o teste focalizado e confirmar GREEN.**

  Run: `npx playwright test tests/e2e/profile.spec.ts --project=mobile-390 -g "opaque avatar shell"`

  Expected: PASS. Enquanto a resposta está bloqueada, o círculo mede `rgb(10, 10, 11)`; depois da libertação, `naturalWidth > 0`.

- [x] **Step 5: Rever visualmente os dois estados reais.**

  Run: iniciar `npm run dev -- --host 127.0.0.1 --port 4321`, bloquear uma vez a imagem com a rota Playwright para confirmar a superfície opaca e depois capturar o viewport 390 por 844 com a imagem carregada.

  Expected: nenhuma linha do banner é visível dentro do círculo no estado bloqueado; com a fotografia carregada, a composição e o anel existentes permanecem intactos.

- [x] **Step 6: Correr regressões, build e verificações de diff.**

  Run: `npm test && npm run build && git diff --check`

  Expected: exit 0, 0 diagnósticos Astro, sem alterações fora dos quatro ficheiros definidos.

- [x] **Step 7: Commit intencional.**

  ```bash
  git add src/layouts/BaseLayout.astro src/styles/global.css tests/e2e/profile.spec.ts \
    docs/superpowers/specs/2026-08-12-avatar-load-shell-design.md \
    docs/superpowers/plans/2026-08-12-avatar-load-shell.md
  git commit -m "fix: stabilise avatar during initial load"
  ```
