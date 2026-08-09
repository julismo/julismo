# Julismo Profile MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, testar e publicar o perfil profissional mobile-first de Julismo na conta Vercel pessoal.

**Architecture:** Uma página Astro estática compõe dados validados, componentes semânticos e ativos locais. CSS próprio fornece o sistema visual; um script cliente pequeno acrescenta o movimento de orientação apenas quando é seguro e confortável. Testes unitários protegem os contratos e a matemática de movimento, enquanto Playwright valida a experiência final em múltiplos viewports.

**Tech Stack:** Astro, TypeScript, CSS, Vitest, Playwright, Node.js, Vercel e GitHub.

## Global Constraints

- O diretório de trabalho é `C:\dev\julismo`; a branch de integração é `development`.
- O MVP é uma página estática em português, sem backend, formulário, analytics, cookies necessários ou credenciais de runtime.
- O nome visível é `Julismo`; `Julismo Costa` só aparece na assinatura e metadados adequados.
- A bio deve ser exatamente: “Simplifico processos que atrasam a equipa, sem trocar o que já funciona.”
- Os cinco destinos são, nesta ordem: WhatsApp `https://api.whatsapp.com/send?phone=351933751885`, ARM Solutions `https://arm-lda.com/`, Email `mailto:julismocosta@gmail.com`, GitHub `https://github.com/julismo`, X `https://x.com/_Julismo`.
- A paleta é preto, branco, cinzentos e prata; não usar neon, partículas, vídeo, parallax de scroll, “glassmorphism” ou texto/controlo de “profundidade”.
- Cada cartão é um único `<a>` com altura mínima de 52 px. A seta e a roseta são decorativas e não podem ser elementos interativos.
- Só o cartão WhatsApp recebe a faixa prateada animada; animações e giroscópio respeitam `prefers-reduced-motion`.
- O giroscópio usa APIs nativas, calibração inicial, zona morta, suavização, limites de ±1,5 graus e ±3 px, e fallback estático quando o browser exigir permissão explícita.
- Produção usa a conta Vercel pessoal `julismo`; `main` publica produção e `development` publica preview.
- O QR code final é SVG local, sem publicidade, expiração ou dependência de runtime, e só é gerado depois de `julismo.vercel.app` estar confirmado.

---

## File structure

```text
astro.config.mjs                         # URL canónica e configuração Astro
package.json                             # scripts e dependências
playwright.config.ts                     # server local e matrizes de viewport
vitest.config.ts                         # ambiente de unit tests com configuração Astro
scripts/generate-qr.mjs                  # gera o SVG de QR após domínio confirmado
src/components/BrandIcon.astro           # SVGs locais de marca/ação
src/components/LinkCard.astro            # um cartão <a> acessível e completo
src/components/ProfileHero.astro         # fotografia, nome, roseta e bio
src/components/VerifiedRosette.astro     # roseta prateada decorativa
src/data/profile.ts                      # conteúdo imutável e URL de produção
src/lib/motion.ts                        # cálculo puro de inclinação limitada
src/lib/profile.ts                       # validação do contrato dos links
src/layouts/BaseLayout.astro             # HTML base e metadados
src/pages/index.astro                    # composição da página
src/scripts/motion.ts                    # melhoria progressiva do DeviceOrientationEvent
src/styles/global.css                    # reset, estrutura e estados acessíveis
src/styles/tokens.css                    # tokens de cor, tamanho e animação
public/favicon.svg                       # favicon monocromático local
public/images/julismo-profile.png        # retrato otimizado fornecido pelo utilizador
public/qr/julismo.svg                    # artefacto final de QR code
tests/unit/motion.test.ts                # limites, zona morta e suavização
tests/unit/profile.test.ts               # contrato de dados e URLs
tests/e2e/profile.spec.ts                # comportamento, a11y, links e movimento reduzido
```

## Task 1: Scaffold Astro and quality tooling

**Files:**

- Create: `astro.config.mjs`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore`

**Interfaces:**

- Produces `npm run dev`, `npm run check`, `npm run test:unit`, `npm run test:e2e`, `npm run test`, `npm run build`, `npm run preview` and `npm run generate:qr`.
- Produces a Vite-aware Vitest environment and a Playwright web server at `http://127.0.0.1:4321`.

- [ ] **Step 1: Create the minimal Astro application without replacing repository documentation**

Run from `C:\dev\julismo`:

```powershell
npm create astro@latest . -- --template minimal --typescript strict --install --no-git
```

Expected: Astro creates `src/`, `public/`, `astro.config.mjs`, `package.json` and `tsconfig.json`; existing `README.md`, `.gitignore` and `docs/` remain in place.

- [ ] **Step 2: Add the test dependencies and scripts**

Run:

```powershell
npm install -D vitest @playwright/test qrcode @types/qrcode
```

Replace the scripts block in `package.json` with:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "npm run check && npm run test:unit && npm run test:e2e",
    "generate:qr": "node scripts/generate-qr.mjs"
  }
}
```

- [ ] **Step 3: Add the failing unit-test configuration check**

Create `vitest.config.ts`:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
```

Create `tests/unit/tooling.test.ts`:

```ts
import { expect, test } from 'vitest';

test('the unit test runner is configured', () => {
  expect(import.meta.env.MODE).toBe('test');
});
```

- [ ] **Step 4: Run the unit test to verify the harness works**

Run:

```powershell
npm run test:unit
```

Expected: one passing test named `the unit test runner is configured`.

- [ ] **Step 5: Configure Playwright before writing browser tests**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'mobile-320', use: { viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'no-js', use: { viewport: { width: 390, height: 844 }, javaScriptEnabled: false } },
  ],
});
```

- [ ] **Step 6: Validate Astro before feature work**

Run:

```powershell
npm run check
```

Expected: `Result (0 errors, 0 warnings, 0 hints)` or the equivalent zero-error Astro report.

- [ ] **Step 7: Commit the baseline tooling**

Run:

```powershell
git add astro.config.mjs package.json package-lock.json tsconfig.json vitest.config.ts playwright.config.ts tests/unit/tooling.test.ts .gitignore
git commit -m "chore: scaffold Astro quality toolchain"
```

## Task 2: Define and validate the profile data contract

**Files:**

- Create: `src/data/profile.ts`
- Create: `src/lib/profile.ts`
- Create: `tests/unit/profile.test.ts`

**Interfaces:**

- Produces `ProfileLink`, `profile`, `siteUrl`, `validateProfileLinks()` and `assertProfileLinks()`.
- `validateProfileLinks(links: readonly ProfileLink[]): string[]` returns every issue without throwing.
- `assertProfileLinks(links: readonly ProfileLink[]): void` throws an `Error` that joins validation failures with `; `.

- [ ] **Step 1: Write the failing data-contract tests**

Create `tests/unit/profile.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { profile } from '../../src/data/profile';
import { assertProfileLinks, validateProfileLinks, type ProfileLink } from '../../src/lib/profile';

const validLink: ProfileLink = {
  id: 'email',
  title: 'Email',
  description: 'Escreve-me diretamente',
  href: 'mailto:julismocosta@gmail.com',
  icon: 'email',
  external: false,
};

describe('profile link contract', () => {
  test('accepts the approved profile links', () => {
    expect(validateProfileLinks(profile.links)).toEqual([]);
    expect(() => assertProfileLinks(profile.links)).not.toThrow();
  });

  test('rejects duplicate IDs, absent copy and unsafe schemes', () => {
    const invalid: ProfileLink[] = [
      validLink,
      { ...validLink, title: '', href: 'javascript:alert(1)' },
    ];

    expect(validateProfileLinks(invalid)).toEqual([
      'duplicate id: email',
      'email is missing a title',
      'email has an unsupported URL scheme',
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the contract does not exist**

Run:

```powershell
npm run test:unit -- tests/unit/profile.test.ts
```

Expected: FAIL with missing module errors for `src/data/profile` and `src/lib/profile`.

- [ ] **Step 3: Implement the profile contract and approved content**

Create `src/lib/profile.ts`:

```ts
export type LinkId = 'whatsapp' | 'arm' | 'email' | 'github' | 'x';
export type IconName = LinkId;

export interface ProfileLink {
  id: LinkId;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  external: boolean;
  primary?: boolean;
}

const allowedSchemes = new Set(['https:', 'mailto:']);

export function validateProfileLinks(links: readonly ProfileLink[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const link of links) {
    if (ids.has(link.id)) issues.push(`duplicate id: ${link.id}`);
    ids.add(link.id);
    if (!link.title.trim()) issues.push(`${link.id} is missing a title`);
    if (!link.description.trim()) issues.push(`${link.id} is missing a description`);

    try {
      const url = new URL(link.href);
      if (!allowedSchemes.has(url.protocol)) issues.push(`${link.id} has an unsupported URL scheme`);
    } catch {
      issues.push(`${link.id} has an invalid URL`);
    }
  }

  return issues;
}

export function assertProfileLinks(links: readonly ProfileLink[]): void {
  const issues = validateProfileLinks(links);
  if (issues.length) throw new Error(issues.join('; '));
}
```

Create `src/data/profile.ts`:

```ts
import { assertProfileLinks, type ProfileLink } from '../lib/profile';

export const siteUrl = new URL('https://julismo.vercel.app/');

export const profile = {
  name: 'Julismo',
  fullName: 'Julismo Costa',
  bio: 'Simplifico processos que atrasam a equipa, sem trocar o que já funciona.',
  image: '/images/julismo-profile.png',
  links: [
    { id: 'whatsapp', title: 'Falar comigo', description: 'WhatsApp · resposta direta', href: 'https://api.whatsapp.com/send?phone=351933751885', icon: 'whatsapp', external: false, primary: true },
    { id: 'arm', title: 'ARM Solutions', description: 'IA e automação para PMEs', href: 'https://arm-lda.com/', icon: 'arm', external: true },
    { id: 'email', title: 'Email', description: 'Escreve-me diretamente', href: 'mailto:julismocosta@gmail.com', icon: 'email', external: false },
    { id: 'github', title: 'GitHub', description: 'Código e projetos open source', href: 'https://github.com/julismo', icon: 'github', external: true },
    { id: 'x', title: 'X', description: 'Ideias e atualizações', href: 'https://x.com/_Julismo', icon: 'x', external: true },
  ] satisfies ProfileLink[],
} as const;

assertProfileLinks(profile.links);
```

- [ ] **Step 4: Re-run the contract test**

Run:

```powershell
npm run test:unit -- tests/unit/profile.test.ts
```

Expected: both contract tests pass.

- [ ] **Step 5: Commit the validated data source**

Run:

```powershell
git add src/data/profile.ts src/lib/profile.ts tests/unit/profile.test.ts
git commit -m "feat: add validated Julismo profile data"
```

## Task 3: Build and test bounded motion mathematics

**Files:**

- Create: `src/lib/motion.ts`
- Create: `tests/unit/motion.test.ts`

**Interfaces:**

- Produces `MotionSample`, `Tilt`, `MOTION_LIMITS`, `calibrate()`, `targetTilt()` and `smoothTilt()`.
- `targetTilt(sample, baseline)` produces values constrained to `rotateX`, `rotateY`, `translateX` and `translateY` limits.

- [ ] **Step 1: Write failing motion tests**

Create `tests/unit/motion.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { calibrate, MOTION_LIMITS, smoothTilt, targetTilt } from '../../src/lib/motion';

describe('motion limits', () => {
  test('calibrates the first finite orientation sample', () => {
    expect(calibrate({ beta: 8, gamma: -4 })).toEqual({ beta: 8, gamma: -4 });
  });

  test('ignores the dead zone and clamps extreme motion', () => {
    const baseline = { beta: 0, gamma: 0 };
    expect(targetTilt({ beta: 0.2, gamma: 0.2 }, baseline)).toEqual({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });

    const tilt = targetTilt({ beta: 90, gamma: -90 }, baseline);
    expect(Math.abs(tilt.rotateX)).toBeLessThanOrEqual(MOTION_LIMITS.maxRotation);
    expect(Math.abs(tilt.rotateY)).toBeLessThanOrEqual(MOTION_LIMITS.maxRotation);
    expect(Math.abs(tilt.translateX)).toBeLessThanOrEqual(MOTION_LIMITS.maxTranslation);
    expect(Math.abs(tilt.translateY)).toBeLessThanOrEqual(MOTION_LIMITS.maxTranslation);
  });

  test('smooths toward a target instead of jumping to it', () => {
    const next = smoothTilt({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 }, { rotateX: 1, rotateY: -1, translateX: 3, translateY: -3 });
    expect(next.rotateX).toBeGreaterThan(0);
    expect(next.rotateX).toBeLessThan(1);
    expect(next.translateX).toBeGreaterThan(0);
    expect(next.translateX).toBeLessThan(3);
  });
});
```

- [ ] **Step 2: Run the test to confirm the implementation is missing**

Run:

```powershell
npm run test:unit -- tests/unit/motion.test.ts
```

Expected: FAIL with a missing module error for `src/lib/motion`.

- [ ] **Step 3: Implement only bounded, pure motion functions**

Create `src/lib/motion.ts`:

```ts
export interface MotionSample { beta: number; gamma: number; }
export interface Tilt { rotateX: number; rotateY: number; translateX: number; translateY: number; }

export const MOTION_LIMITS = {
  deadZone: 0.8,
  maxRotation: 1.5,
  maxTranslation: 3,
  smoothing: 0.12,
} as const;

const zeroTilt = (): Tilt => ({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export function calibrate(sample: MotionSample): MotionSample | null {
  return Number.isFinite(sample.beta) && Number.isFinite(sample.gamma) ? sample : null;
}

export function targetTilt(sample: MotionSample, baseline: MotionSample): Tilt {
  const betaDelta = sample.beta - baseline.beta;
  const gammaDelta = sample.gamma - baseline.gamma;
  if (Math.abs(betaDelta) < MOTION_LIMITS.deadZone && Math.abs(gammaDelta) < MOTION_LIMITS.deadZone) return zeroTilt();

  const rotateX = clamp(-betaDelta / 18, MOTION_LIMITS.maxRotation);
  const rotateY = clamp(gammaDelta / 18, MOTION_LIMITS.maxRotation);
  return {
    rotateX,
    rotateY,
    translateX: clamp(rotateY * 2, MOTION_LIMITS.maxTranslation),
    translateY: clamp(-rotateX * 2, MOTION_LIMITS.maxTranslation),
  };
}

export function smoothTilt(current: Tilt, target: Tilt): Tilt {
  const blend = (from: number, to: number) => from + (to - from) * MOTION_LIMITS.smoothing;
  return {
    rotateX: blend(current.rotateX, target.rotateX),
    rotateY: blend(current.rotateY, target.rotateY),
    translateX: blend(current.translateX, target.translateX),
    translateY: blend(current.translateY, target.translateY),
  };
}
```

- [ ] **Step 4: Run all unit tests**

Run:

```powershell
npm run test:unit
```

Expected: tooling, profile and motion test suites pass.

- [ ] **Step 5: Commit the motion contract**

Run:

```powershell
git add src/lib/motion.ts tests/unit/motion.test.ts
git commit -m "feat: add bounded orientation motion logic"
```

## Task 4: Implement semantic profile components and local assets

**Files:**

- Create: `src/components/BrandIcon.astro`
- Create: `src/components/VerifiedRosette.astro`
- Create: `src/components/ProfileHero.astro`
- Create: `src/components/LinkCard.astro`
- Create: `public/images/julismo-profile.png`
- Create: `public/favicon.svg`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

**Interfaces:**

- `BrandIcon` consumes `name: IconName` and exposes a decorative local SVG.
- `LinkCard` consumes a `ProfileLink` and renders a single correctly attributed `<a>`.
- `ProfileHero` consumes `name`, `bio` and `image` and renders the page heading.

- [ ] **Step 1: Write a failing end-to-end expectation for the final semantic hierarchy**

Create `tests/e2e/profile.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('renders the approved identity and five complete action cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Julismo' })).toBeVisible();
  await expect(page.getByText('Simplifico processos que atrasam a equipa, sem trocar o que já funciona.')).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /Falar comigo.*WhatsApp.*resposta direta/ })).toHaveAttribute('href', 'https://api.whatsapp.com/send?phone=351933751885');
});
```

- [ ] **Step 2: Run the E2E test to confirm the empty starter page does not satisfy it**

Run:

```powershell
npm run test:e2e -- tests/e2e/profile.spec.ts --project=mobile-390
```

Expected: FAIL because heading “Julismo” and the five action cards are not present.

- [ ] **Step 3: Copy and optimize the approved portrait locally**

Copy the supplied image to `public/images/julismo-profile.png`, preserving only the image file and no unrelated Downloads content:

```powershell
Copy-Item -LiteralPath 'C:\Users\julis\Downloads\unnamed.png' -Destination 'C:\dev\julismo\public\images\julismo-profile.png'
```

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="J"><rect width="64" height="64" rx="16" fill="#0A0A0B"/><path d="M39 14v25c0 8-4.2 12-11.2 12-4.7 0-8.4-2.1-10.8-5.8l5.4-3.8c1.2 1.9 2.7 3.1 5.1 3.1 3.2 0 5.2-1.9 5.2-6.4V14h6.3Z" fill="#F5F5F4"/></svg>
```

- [ ] **Step 4: Implement the local visual primitives**

Create `src/components/VerifiedRosette.astro`:

```astro
<svg aria-hidden="true" class="verified-rosette" viewBox="0 0 24 24" fill="none">
  <path d="m12 2.75 2.08 1.42 2.51-.16.95 2.33 2.2 1.22-.55 2.46 1.24 2.19-1.24 2.19.55 2.46-2.2 1.22-.95 2.33-2.51-.16L12 21.25l-2.08-1.42-2.51.16-.95-2.33-2.2-1.22.55-2.46-1.24-2.19 1.24-2.19-.55-2.46 2.2-1.22.95-2.33 2.51.16L12 2.75Z" fill="currentColor"/>
  <path d="m8.3 12.1 2.3 2.25 5.1-5.1" stroke="#111113" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.85"/>
</svg>
```

Create `src/components/BrandIcon.astro` with the `name: IconName` prop and an explicit `switch` for `whatsapp`, `arm`, `email`, `github` and `x`. Every branch returns an inline, `aria-hidden="true"`, 24×24 SVG using `currentColor`; do not request an external icon source.

Create `src/components/ProfileHero.astro`:

```astro
---
import VerifiedRosette from './VerifiedRosette.astro';
interface Props { name: string; bio: string; image: string; }
const { name, bio, image } = Astro.props;
---
<header class="profile-hero">
  <img class="profile-hero__image" src={image} alt="Retrato profissional de Julismo" width="192" height="192" loading="eager" decoding="async" />
  <div class="profile-hero__name-row">
    <h1>{name}</h1><VerifiedRosette />
  </div>
  <p class="profile-hero__bio">{bio}</p>
</header>
```

Create `src/components/LinkCard.astro`:

```astro
---
import BrandIcon from './BrandIcon.astro';
import type { ProfileLink } from '../lib/profile';
interface Props { link: ProfileLink; }
const { link } = Astro.props;
const externalAttributes = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
---
<a class:list={['link-card', { 'link-card--primary': link.primary }]} href={link.href} {...externalAttributes} aria-label={`${link.title}: ${link.description}`}>
  <span class="link-card__icon"><BrandIcon name={link.icon} /></span>
  <span class="link-card__copy"><strong>{link.title}</strong><small>{link.description}</small></span>
  <span class="link-card__arrow" aria-hidden="true">↗</span>
</a>
```

- [ ] **Step 5: Implement the CSS tokens and responsive baseline**

Create `src/styles/tokens.css`:

```css
:root {
  --bg: #0a0a0b;
  --surface: #171719;
  --surface-raised: #1c1c1f;
  --text: #f5f5f4;
  --muted: #a1a1aa;
  --line: rgb(255 255 255 / 14%);
  --silver: #d4d4d8;
  --radius: 15px;
  --content-width: 440px;
  --shadow: 0 20px 50px rgb(0 0 0 / 28%);
}
```

Create `src/styles/global.css` with this required behavior:

```css
@import './tokens.css';

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
body { min-width: 320px; min-height: 100svh; margin: 0; background: radial-gradient(circle at 50% -15%, #202024 0, var(--bg) 44rem); }
a { color: inherit; }
.page-shell { width: min(calc(100% - 32px), var(--content-width)); margin: 0 auto; padding: 44px 0 32px; }
.profile-hero { display: grid; justify-items: center; text-align: center; gap: 12px; margin-bottom: 28px; }
.profile-hero__image { width: 112px; height: 112px; border: 1px solid var(--line); border-radius: 50%; object-fit: cover; box-shadow: var(--shadow); }
.profile-hero__name-row { display: flex; align-items: center; gap: 7px; }
.profile-hero h1 { margin: 0; font-size: clamp(1.7rem, 7vw, 2.15rem); letter-spacing: -0.04em; }
.verified-rosette { width: 21px; color: var(--silver); }
.profile-hero__bio { max-width: 32ch; margin: 0; color: var(--muted); font-size: 0.96rem; line-height: 1.55; }
.link-list { display: grid; gap: 12px; }
.link-card { position: relative; display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: center; min-height: 64px; gap: 12px; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: linear-gradient(135deg, var(--surface-raised), var(--surface)); padding: 10px 14px; text-decoration: none; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
.link-card:hover { border-color: rgb(255 255 255 / 28%); transform: translateY(-1px); }
.link-card:active { transform: translateY(0) scale(.992); }
.link-card:focus-visible { outline: 3px solid #f5f5f4; outline-offset: 4px; }
.link-card__icon { display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid var(--line); border-radius: 50%; color: var(--text); }
.link-card__copy { display: grid; gap: 2px; min-width: 0; }
.link-card__copy strong { font-size: .98rem; }
.link-card__copy small { color: var(--muted); font-size: .8rem; }
.link-card__arrow { color: var(--muted); font-size: 1.05rem; }
.page-footer { margin: 28px 0 0; color: var(--muted); font-size: .78rem; text-align: center; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 1ms !important; animation-duration: 1ms !important; animation-iteration-count: 1 !important; } }
```

- [ ] **Step 6: Run the initial browser test and check**

Run:

```powershell
npm run check
npm run test:e2e -- tests/e2e/profile.spec.ts --project=mobile-390
```

Expected: Astro check passes; the E2E test still fails until Task 5 composes the page.

- [ ] **Step 7: Commit reusable components and design primitives**

Run:

```powershell
git add src/components src/styles public/images/julismo-profile.png public/favicon.svg tests/e2e/profile.spec.ts
git commit -m "feat: add Julismo profile visual primitives"
```

## Task 5: Compose the page, metadata and priority CTA

**Files:**

- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`

**Interfaces:**

- `BaseLayout` consumes `title` and `description` and outputs consistent document head metadata.
- `index.astro` maps `profile.links` directly to `LinkCard`; it never duplicates link data.

- [ ] **Step 1: Create the minimal layout implementation that makes the E2E test pass**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import { siteUrl } from '../data/profile';
interface Props { title: string; description: string; }
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={siteUrl.href} />
    <meta name="twitter:card" content="summary" />
    <link rel="canonical" href={siteUrl.href} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>{title}</title>
  </head>
  <body><slot /></body>
</html>
```

Create `src/pages/index.astro`:

```astro
---
import LinkCard from '../components/LinkCard.astro';
import ProfileHero from '../components/ProfileHero.astro';
import { profile } from '../data/profile';
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Julismo — Processos mais simples" description={profile.bio}>
  <main class="page-shell" data-profile-plane>
    <ProfileHero name={profile.name} bio={profile.bio} image={profile.image} />
    <nav class="link-list" aria-label="Contactos e presença digital">
      {profile.links.map((link) => <LinkCard link={link} />)}
    </nav>
    <footer class="page-footer">{profile.fullName}</footer>
  </main>
</BaseLayout>
```

Set `site` in `astro.config.mjs`:

```ts
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://julismo.vercel.app',
});
```

- [ ] **Step 2: Add the single subtle WhatsApp border beam**

Append to `src/styles/global.css`:

```css
.link-card--primary::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: conic-gradient(from var(--beam-angle, 0deg), transparent 0 58%, rgb(255 255 255 / 8%) 66%, #f4f4f5 75%, rgb(255 255 255 / 8%) 84%, transparent 92%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: silver-beam 8.5s linear infinite; pointer-events: none; }
@property --beam-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes silver-beam { to { --beam-angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .link-card--primary::before { animation: none; } }
```

- [ ] **Step 3: Run the semantic E2E test and inspect rendered HTML**

Run:

```powershell
npm run check
npm run test:e2e -- tests/e2e/profile.spec.ts --project=mobile-390
```

Expected: test passes with exactly five actionable profile links and no nested arrow button.

- [ ] **Step 4: Commit page composition**

Run:

```powershell
git add astro.config.mjs src/layouts/BaseLayout.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: compose mobile-first Julismo profile"
```

## Task 6: Add progressive orientation enhancement and test reduced motion

**Files:**

- Create: `src/scripts/motion.ts`
- Modify: `src/pages/index.astro`
- Modify: `tests/e2e/profile.spec.ts`

**Interfaces:**

- `src/scripts/motion.ts` sets `document.documentElement.dataset.motion` to `active`, `static` or `reduced`.
- It imports `calibrate`, `smoothTilt` and `targetTilt` from `src/lib/motion.ts` and applies CSS variables only to `[data-profile-plane]`.

- [ ] **Step 1: Extend the browser tests for keyboard access, no-JS content and reduced motion**

Append to `tests/e2e/profile.spec.ts`:

```ts
test('keeps the full card keyboard-operable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Falar comigo.*WhatsApp.*resposta direta/ })).toBeFocused();
  await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '58px');
});

test('has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('reduces motion when requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const beamAnimation = await page.locator('.link-card--primary').evaluate((element) => getComputedStyle(element, '::before').animationName);
  expect(beamAnimation).toBe('none');
});
```

- [ ] **Step 2: Run the new tests and verify the motion-specific expectation fails**

Run:

```powershell
npm run test:e2e -- tests/e2e/profile.spec.ts --project=mobile-390
```

Expected: the reduced-motion test fails because `data-motion="reduced"` is not yet emitted.

- [ ] **Step 3: Implement motion as a safe progressive enhancement**

Create `src/scripts/motion.ts`:

```ts
import { calibrate, smoothTilt, targetTilt, type MotionSample, type Tilt } from '../lib/motion';

const root = document.documentElement;
const plane = document.querySelector<HTMLElement>('[data-profile-plane]');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const orientationEvent = typeof DeviceOrientationEvent === 'undefined' ? undefined : DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
const requiresPermission = Boolean(orientationEvent?.requestPermission);

if (!plane || reduced || !orientationEvent || requiresPermission) {
  root.dataset.motion = reduced ? 'reduced' : 'static';
} else {
  let baseline: MotionSample | null = null;
  let current: Tilt = { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 };
  let frame = 0;

  const render = () => {
    frame = 0;
    plane.style.setProperty('--tilt-x', `${current.rotateX}deg`);
    plane.style.setProperty('--tilt-y', `${current.rotateY}deg`);
    plane.style.setProperty('--shift-x', `${current.translateX}px`);
    plane.style.setProperty('--shift-y', `${current.translateY}px`);
  };

  window.addEventListener('deviceorientation', (event) => {
    if (document.hidden || event.beta === null || event.gamma === null) return;
    const sample = { beta: event.beta, gamma: event.gamma };
    baseline ??= calibrate(sample);
    if (!baseline) return;
    current = smoothTilt(current, targetTilt(sample, baseline));
    if (!frame) {
      frame = window.requestAnimationFrame(render);
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  root.dataset.motion = 'active';
}
```

Add before the closing `</main>` in `src/pages/index.astro`:

```astro
<script>
  import '../scripts/motion';
</script>
```

Append to `src/styles/global.css`:

```css
[data-profile-plane] { transform: perspective(900px) translate3d(var(--shift-x, 0), var(--shift-y, 0), 0) rotateX(var(--tilt-x, 0)) rotateY(var(--tilt-y, 0)); will-change: transform; }
@media (prefers-reduced-motion: reduce) { [data-profile-plane] { transform: none; will-change: auto; } }
```

- [ ] **Step 4: Run all tests, including no-JS**

Run:

```powershell
npm run test:unit
npm run test:e2e -- tests/e2e/profile.spec.ts
```

Expected: all browser projects pass; the no-JS project still renders the five card links because server-rendered HTML carries all core content.

- [ ] **Step 5: Commit progressive motion**

Run:

```powershell
git add src/scripts/motion.ts src/pages/index.astro src/styles/global.css tests/e2e/profile.spec.ts
git commit -m "feat: add accessible progressive orientation motion"
```

## Task 7: Validate visuals, content and production assets

**Files:**

- Create: `scripts/generate-qr.mjs`
- Create: `public/qr/julismo.svg`
- Modify: `README.md`

**Interfaces:**

- `npm run generate:qr` creates the static final QR at `public/qr/julismo.svg` for `https://julismo.vercel.app/`.
- QR output is deliberately not displayed in the narrow mobile profile; it is available as a reusable production asset at `/qr/julismo.svg`.

- [ ] **Step 1: Write the QR generator before creating its output**

Create `scripts/generate-qr.mjs`:

```js
import { mkdir } from 'node:fs/promises';
import QRCode from 'qrcode';

const target = 'https://julismo.vercel.app/';
await mkdir('public/qr', { recursive: true });
await QRCode.toFile('public/qr/julismo.svg', target, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0A0A0B', light: '#FFFFFF' },
});
console.log(`QR code generated for ${target}`);
```

- [ ] **Step 2: Generate and verify the static QR artefact**

Run:

```powershell
npm run generate:qr
Test-Path 'public/qr/julismo.svg'
```

Expected: output contains `QR code generated for https://julismo.vercel.app/` and `Test-Path` returns `True`.

- [ ] **Step 3: Capture real browser screenshots for visual review**

Run the local server, then use Playwright CLI with a fresh snapshot before every interaction:

```powershell
npm run dev -- --host 127.0.0.1 --port 4321
```

In a second terminal:

```bash
export CODEX_HOME="C:/Users/julis/.codex"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
cd "C:/dev/Obsidian/output/playwright"
"$PWCLI" -s=julismo-final open "http://127.0.0.1:4321"
"$PWCLI" -s=julismo-final resize 390 844
"$PWCLI" -s=julismo-final snapshot
"$PWCLI" -s=julismo-final screenshot
"$PWCLI" -s=julismo-final resize 1440 1000
"$PWCLI" -s=julismo-final snapshot
"$PWCLI" -s=julismo-final screenshot
```

Expected: screenshots show a cohesive black/white/silver mobile-first layout, unclipped cards, correctly proportioned image, visible focus treatment and only one animated beam.

- [ ] **Step 4: Run the full release test gate**

Run:

```powershell
npm run check
npm run test
npm run build
```

Expected: all commands exit zero and `dist/` contains a static build.

- [ ] **Step 5: Document local use and QR location**

Append to `README.md`:

```markdown
## Verificação

```powershell
npm install
npm run check
npm run test
npm run build
npm run generate:qr
```

O QR final fica em `public/qr/julismo.svg` e, em produção, em `/qr/julismo.svg`.
```

- [ ] **Step 6: Commit production-ready assets and verification documentation**

Run:

```powershell
git add scripts/generate-qr.mjs public/qr/julismo.svg README.md
git commit -m "feat: add production QR asset and verification guide"
```

## Task 8: Publish repository, configure Vercel and smoke-test production

**Files:**

- Modify: `astro.config.mjs` only if Vercel proves `julismo.vercel.app` unavailable and the fallback is actually used.
- Modify: `scripts/generate-qr.mjs` and regenerate `public/qr/julismo.svg` only if the final production hostname changes.

**Interfaces:**

- Produces GitHub `origin` pointing to `julismo/julismo`.
- Produces remote `main` and `development` branches.
- Produces a Vercel project owned by the personal `julismo` account and a live production URL.

- [ ] **Step 1: Confirm the intended GitHub and Vercel identities before any remote write**

Run:

```powershell
gh auth status
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' whoami
```

Expected: active GitHub account is `julismo` and Vercel reports `julismo`; no Trion identity is selected.

- [ ] **Step 2: Create the private GitHub remote, add origin and publish both branches**

Run:

```powershell
gh repo create julismo --private --source . --remote origin --push
git push -u origin development
git ls-remote --heads origin main development
```

Expected: `origin` is the personal `julismo/julismo` repository and the final command lists both `refs/heads/main` and `refs/heads/development`.

- [ ] **Step 3: Import/deploy with the personal Vercel configuration**

Run from `C:\dev\julismo`:

```powershell
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' link --yes --project julismo
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' --prod --yes
```

Expected: Vercel creates/links project `julismo` under the personal account and returns a deployment URL.

- [ ] **Step 4: Attach and verify the intended production hostname**

Run:

```powershell
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' domains add julismo.vercel.app julismo
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' domains inspect julismo.vercel.app
```

Expected: inspection associates `julismo.vercel.app` with the personal project. If Vercel reports the hostname is unavailable, change the site URL and QR target together to `https://julismocosta.vercel.app/`, deploy again, and report the fallback in the final handoff.

- [ ] **Step 5: Redeploy after final URL and QR generation**

Run:

```powershell
npm run generate:qr
git add astro.config.mjs scripts/generate-qr.mjs public/qr/julismo.svg
git commit -m "chore: finalize production URL and QR"
git push origin development
git switch main
git merge --ff-only development
git push origin main
Remove-Item Env:VERCEL_TOKEN -ErrorAction SilentlyContinue
npx --yes vercel@latest --global-config 'C:\Users\julis\AppData\Local\vercel-julismo' --prod --yes
git switch development
```

Expected: the QR’s target and site canonical match the production hostname, and `main` is the deployed release branch.

- [ ] **Step 6: Run a production smoke test with Playwright and HTTP checks**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing 'https://julismo.vercel.app' | Select-Object -ExpandProperty StatusCode
```

Then run a fresh Playwright session against the production hostname:

```bash
export CODEX_HOME="C:/Users/julis/.codex"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
cd "C:/dev/Obsidian/output/playwright"
"$PWCLI" -s=julismo-production open "https://julismo.vercel.app"
"$PWCLI" -s=julismo-production resize 390 844
"$PWCLI" -s=julismo-production snapshot
"$PWCLI" -s=julismo-production screenshot
```

Expected: HTTP 200, exact heading/bio, five functional cards, no horizontal overflow and a production screenshot that matches the approved visual direction.

- [ ] **Step 7: Record the finished release state**

Run:

```powershell
git status --short --branch
git log --oneline --decorate -5
git remote -v
```

Expected: clean `development` working tree, both branches pushed, and `origin` points to the personal GitHub repository.

## Plan self-review

### Spec coverage

- Brand, approved bio, exact personal links, ARM destination, local portrait, roseta and visual direction are covered in Tasks 2, 4 and 5.
- Mobile layout, whole-card interaction, focus, no-JS operation and reduced motion are covered in Tasks 4–7.
- The single WhatsApp beam and bounded device orientation enhancement are covered in Tasks 3, 5 and 6.
- Local icons, favicon, metadata, canonical URL and static QR asset are covered in Tasks 4, 5 and 7.
- GitHub branches, personal Vercel identity, hostname claim, deployment and production smoke test are covered in Task 8.
- Unit, end-to-end, visual and release validation are covered in Tasks 1–8.

### Placeholder scan

The plan contains no unresolved implementation markers. The only conditional branch is the documented hostname fallback, which has an exact paired update to the canonical URL and QR payload.

### Type consistency

`ProfileLink`, `IconName`, `validateProfileLinks`, `assertProfileLinks`, `MotionSample`, `Tilt`, `calibrate`, `targetTilt` and `smoothTilt` are defined before their consuming tasks and retain the same names and signatures throughout this plan.
