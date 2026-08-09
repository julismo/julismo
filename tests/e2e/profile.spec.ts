import { expect, test, type Page } from '@playwright/test';

const emulateSafariMotionPermissions = async (
  page: Page,
  permissions: { orientation: 'granted' | 'denied'; motion: 'granted' | 'denied' },
) => {
  await page.addInitScript((permissionState) => {
    const requests: string[] = [];
    Object.defineProperty(window, '__motionPermissionRequests', {
      configurable: true,
      value: requests,
    });

    class SafariOrientationEvent extends Event {
      beta: number | null;
      gamma: number | null;

      constructor(type: string, init: { beta?: number; gamma?: number } = {}) {
        super(type);
        this.beta = init.beta ?? null;
        this.gamma = init.gamma ?? null;
      }
    }

    class SafariMotionEvent extends Event {
      acceleration: { x: number | null; y: number | null; z: number | null };
      accelerationIncludingGravity: { x: number | null; y: number | null; z: number | null };
      rotationRate: { alpha: number | null; beta: number | null; gamma: number | null };
      interval: number;

      constructor(
        type: string,
        init: {
          accelerationIncludingGravity?: { x?: number | null; y?: number | null; z?: number | null };
        } = {},
      ) {
        super(type);
        this.acceleration = { x: null, y: null, z: null };
        this.accelerationIncludingGravity = {
          x: init.accelerationIncludingGravity?.x ?? null,
          y: init.accelerationIncludingGravity?.y ?? null,
          z: init.accelerationIncludingGravity?.z ?? null,
        };
        this.rotationRate = { alpha: null, beta: null, gamma: null };
        this.interval = 0;
      }
    }

    Object.defineProperty(SafariOrientationEvent, 'requestPermission', {
      value: async () => {
        requests.push('orientation');
        return permissionState.orientation;
      },
    });
    Object.defineProperty(SafariMotionEvent, 'requestPermission', {
      value: async () => {
        requests.push('motion');
        return permissionState.motion;
      },
    });
    Object.defineProperty(window, 'DeviceOrientationEvent', {
      configurable: true,
      value: SafariOrientationEvent,
    });
    Object.defineProperty(window, 'DeviceMotionEvent', {
      configurable: true,
      value: SafariMotionEvent,
    });
  }, permissions);
};

test('uses a desktop banner focal point without changing the mobile crop', async ({ page }, testInfo) => {
  await page.goto('/');
  const objectPosition = await page.locator('.profile-hero__banner img').evaluate(
    (image) => getComputedStyle(image).objectPosition,
  );

  if (testInfo.project.name === 'desktop' || testInfo.project.name === 'tablet-768') {
    expect(objectPosition).toBe('50% 100%');
  }

  if (testInfo.project.name === 'mobile-320' || testInfo.project.name === 'mobile-390' || testInfo.project.name === 'no-js') {
    expect(objectPosition).toBe('100% 50%');
  }
});

test('keeps the desktop banner legible and the solutions hierarchy contained', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop composition is calibrated once at 1440 by 900.');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const layout = await page.locator('body').evaluate((body) => {
    const banner = document.querySelector<HTMLElement>('.profile-hero__banner')!;
    const image = banner.querySelector('img')!;
    const card = document.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;
    const section = document.querySelector<HTMLElement>('.link-section-label')!;
    const armCopy = document.querySelector<HTMLElement>('[data-link-id="arm"] .link-card__copy')!;
    const cardBox = card.getBoundingClientRect();
    const sectionBox = section.getBoundingClientRect();
    const armCopyBox = armCopy.getBoundingClientRect();
    const customScrollbarSelectors = Array.from(document.styleSheets).flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => ('selectorText' in rule ? (rule as CSSStyleRule).selectorText : ''))
          .filter((selector) => selector.includes('::-webkit-scrollbar'));
      } catch {
        return [];
      }
    });

    return {
      bannerHeight: banner.getBoundingClientRect().height,
      imagePosition: getComputedStyle(image).objectPosition,
      scrollbarWidth: getComputedStyle(body).scrollbarWidth,
      customScrollbarSelectors,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      cardWidth: cardBox.width,
      cardCenter: cardBox.left + cardBox.width / 2,
      sectionText: section.textContent?.trim(),
      sectionLeft: sectionBox.left,
      armCopyLeft: armCopyBox.left,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(layout.imagePosition).toBe('50% 100%');
  expect(layout.bannerHeight).toBeGreaterThanOrEqual(230);
  expect(layout.scrollbarWidth).toBe('auto');
  expect(layout.customScrollbarSelectors).toEqual([]);
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.cardWidth).toBeGreaterThanOrEqual(429);
  expect(layout.cardWidth).toBeLessThanOrEqual(431);
  expect(Math.abs(layout.cardCenter - 720)).toBeLessThanOrEqual(1);
  expect(layout.sectionText).toBe('SOLUÇÕES');
  expect(Math.abs(layout.sectionLeft - layout.armCopyLeft)).toBeLessThanOrEqual(1);
  expect(layout.horizontalOverflow).toBe(false);
});

test('keeps cards comfortably inset within mobile safe gutters', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Safe touch gutters are calibrated at the primary mobile viewport.');

  await page.goto('/');

  const geometry = await page.locator('[data-link-id="whatsapp"]').evaluate((card) => {
    const box = card.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      width: box.width,
      viewportWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(geometry.left).toBeGreaterThanOrEqual(20);
  expect(geometry.left).toBeLessThanOrEqual(24);
  expect(geometry.viewportWidth - geometry.right).toBeGreaterThanOrEqual(20);
  expect(geometry.viewportWidth - geometry.right).toBeLessThanOrEqual(24);
  expect(geometry.width).toBeGreaterThanOrEqual(geometry.viewportWidth - 48);
  expect(geometry.horizontalOverflow).toBe(false);
});

test('loads Cal only after intent and restores focus after Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'no-js', 'The no-JS project preserves the new-tab fallback.');

  const calRequests: string[] = [];
  page.on('request', (request) => {
    if (/(^|\.)cal\.com\//.test(new URL(request.url()).hostname + '/')) {
      calRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expect(page.locator('#cal-dialog')).toBeHidden();
  expect(calRequests).toEqual([]);

  const bookingCard = page.locator('[data-cal-trigger]');
  await bookingCard.click();
  const dialog = page.locator('#cal-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');
  await expect(dialog).toHaveAttribute('aria-labelledby', 'cal-dialog-title');
  await expect(dialog.getByRole('link', { name: /abrir.*nova página/i })).toHaveAttribute(
    'href',
    'https://cal.com/julismo-costa-3nxpms/30min',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(bookingCard).toBeFocused();
});

test('keeps the Cal dialog usable when its lazy module cannot load', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This lazy-load failure contract runs once at the desktop viewport.');

  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  await page.route('**/@calcom_embed-snippet.js*', (route) => route.abort('failed'));

  await page.goto('/');
  await page.locator('[data-cal-trigger]').click();

  await expect(page.locator('#cal-dialog')).toBeVisible();
  await expect(page.locator('[data-cal-status]')).toHaveText(
    'Não foi possível carregar o calendário. Pode abrir o agendamento numa nova página.',
  );
  await page.waitForTimeout(100);
  expect(pageErrors).toEqual([]);
});

test('closes the Cal dialog when its backdrop is clicked', async ({ page }, testInfo) => {
  test.skip(
    ['no-js', 'mobile-320', 'mobile-390'].includes(testInfo.project.name),
    'The no-JS project preserves the fallback and full-screen mobile dialogs have no exposed backdrop.',
  );

  await page.goto('/');
  await page.locator('[data-cal-trigger]').click();
  const dialog = page.locator('#cal-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  const panel = await dialog.boundingBox();
  if (!panel) throw new Error('O diálogo Cal não tem dimensões visíveis.');

  await page.mouse.click(panel.x - 8, panel.y + 8);
  await expect(dialog).not.toHaveAttribute('open', '');
});

test('renders the approved identity and five direct links plus the ARM disclosure', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Julismo' })).toBeVisible();
  await expect(
    page.getByText('Simplifico processos que atrasam a equipa, sem trocar o que já funciona.'),
  ).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(5);
  await expect(page.locator('summary[data-arm-summary]')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: /Falar comigo.*WhatsApp.*resposta direta/ }),
  ).toHaveAttribute(
    'href',
    'https://api.whatsapp.com/send?phone=351933751885&text=Ol%C3%A1%2C%20Julismo.%20Vi%20o%20teu%20perfil%20e%20gostava%20de%20falar%20contigo.',
  );
});

test('groups business solutions and digital presence without interrupting contacts', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.link-list > *')).toHaveCount(8);

  const sequence = await page.locator('.link-list > *').evaluateAll((items) =>
    items.map((item) =>
      item.classList.contains('link-section-label')
        ? `label:${item.textContent?.trim()}`
        : item.matches('details[data-solutions-disclosure][data-link-id="arm"]')
          ? 'disclosure:arm'
        : `link:${item.getAttribute('data-link-id')}`,
    ),
  );

  expect(sequence).toEqual([
    'link:whatsapp',
    'link:cal',
    'link:email',
    'label:SOLUÇÕES',
    'disclosure:arm',
    'label:PRESENÇA',
    'link:linkedin',
    'link:github',
  ]);

  const presenceGeometry = await page.evaluate(() => {
    const linkedIn = document.querySelector<HTMLElement>('[data-link-id="linkedin"]')!;
    const github = document.querySelector<HTMLElement>('[data-link-id="github"]')!;
    return {
      linkedInTop: linkedIn.getBoundingClientRect().top,
      githubTop: github.getBoundingClientRect().top,
    };
  });
  expect(presenceGeometry.linkedInTop).toBeLessThan(presenceGeometry.githubTop);

  const armDisclosure = page.locator('.link-list > details[data-solutions-disclosure][data-link-id="arm"]');
  const armSummary = page.locator(
    'details[data-solutions-disclosure][data-link-id="arm"] > summary[data-arm-summary]',
  );
  await expect(armDisclosure).toHaveCount(1);
  await expect(armDisclosure).not.toHaveAttribute('open', '');
  await expect(page.locator('.link-list > a[data-link-id="arm"]')).toHaveCount(0);
  await armSummary.focus();
  await expect(armSummary).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-link-id="linkedin"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-link-id="github"]')).toBeFocused();
});

test('reveals ARM entry solutions progressively and keeps its website available', async ({ page }, testInfo) => {
  await page.goto('/');

  const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  const summary = page.locator(
    'details[data-solutions-disclosure][data-link-id="arm"] > summary[data-arm-summary]',
  );
  await expect(disclosure).toHaveCount(1);
  await expect(summary).toHaveCount(1);
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(summary.getByText('Para distribuição, transportes e logística')).toBeVisible();

  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(disclosure.locator('[data-solution-id]')).toHaveCount(3);

  // As três soluções são slides de um carrossel: só a activa está visível de cada vez.
  // Os chips, esses, estão sempre os três visíveis e servem de navegação.
  await expect(disclosure.locator('[data-solution-slide="0"]')).toHaveAttribute('data-active', 'true');
  await expect(disclosure.getByText('Orçamentos que chegam a tempo')).toBeVisible();
  await expect(disclosure.locator('[data-solution-slide="1"]')).toHaveAttribute('data-active', 'false');
  await expect(disclosure.locator('[data-solution-slide="2"]')).toHaveAttribute('data-active', 'false');

  const chips = disclosure.locator('[data-solution-chip]');
  await expect(chips).toHaveCount(3);
  await expect(chips.nth(0)).toHaveText(/Orçamentos/);
  await expect(chips.nth(1)).toHaveText(/Documentos/);
  await expect(chips.nth(2)).toHaveText(/Operação/);
  await expect(disclosure.locator('[data-solution-dot]')).toHaveCount(3);

  const visuals = disclosure.locator('[data-solution-image]');
  await expect(visuals).toHaveCount(3);
  const visualMetadata = await visuals.evaluateAll((images) => images.map((image) => ({
    src: image.getAttribute('src'),
    dataSrc: image.getAttribute('data-src'),
    alt: image.getAttribute('alt'),
    ariaHidden: image.getAttribute('aria-hidden'),
    width: image.getAttribute('width'),
    height: image.getAttribute('height'),
    loading: image.getAttribute('loading'),
    decoding: image.getAttribute('decoding'),
  })));

  // Só o primeiro banner tem `src` no HTML servido. `loading="lazy"` não impede o download:
  // com a secção fechada o browser puxava os três, e a maioria das visitas nunca a abre.
  // Os outros dois são hidratados por JS na primeira abertura.
  for (const [position, image] of visualMetadata.entries()) {
    expect(image, `banner ${position} metadata`).toMatchObject({
      alt: '',
      ariaHidden: 'true',
      width: '1176',
      height: '504',
      loading: 'lazy',
      decoding: 'async',
    });
  }
  expect(visualMetadata[0]!.src).toBe('/images/arm-solutions/quotes.webp');
  expect(visualMetadata[0]!.dataSrc).toBeNull();

  // Com JS, abrir a secção hidrata os três. Sem JS não há rotação, por isso os outros dois
  // nunca chegam a ser mostrados e não terem `src` é o comportamento correcto.
  if (testInfo.project.name !== 'no-js') {
    await expect
      .poll(async () => (await visuals.evaluateAll((images) => images.map((i) => i.getAttribute('src')))).filter(Boolean).length)
      .toBe(3);
  } else {
    expect(visualMetadata[1]!.src).toBeNull();
    expect(visualMetadata[1]!.dataSrc).toBe('/images/arm-solutions/documents.webp');
    expect(visualMetadata[2]!.dataSrc).toBe('/images/arm-solutions/operations.webp');
  }

  const armSite = disclosure.locator('[data-arm-site]');
  await expect(armSite).toHaveAttribute('href', 'https://arm-lda.com/');
  await expect(armSite).toHaveAttribute('target', '_blank');
  await expect(armSite).toHaveAttribute('rel', 'noopener noreferrer');
});

test('ARM carousel supports manual keyboard selection', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'no-js', 'Carousel navigation is a JS enhancement; without it the first solution stays put.');

  await page.goto('/');

  const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  await disclosure.locator('summary[data-arm-summary]').click();
  await expect(disclosure).toHaveAttribute('open', '');

  const panel = (id: 'quotes' | 'documents' | 'operations') => disclosure.locator(`#solution-slide-${id}`);
  const tab = (id: 'quotes' | 'documents' | 'operations') => disclosure.locator(`#solution-tab-${id}`);
  const chip = (id: 'quotes' | 'documents' | 'operations') => disclosure.locator(`[data-solution-chip-id="${id}"]`);

  await expect(panel('quotes')).toHaveAttribute('role', 'tabpanel');
  await expect(panel('quotes')).toHaveAttribute('aria-labelledby', 'solution-tab-quotes');
  await expect(tab('quotes')).toHaveAttribute('role', 'tab');
  await expect(tab('quotes')).toHaveAttribute('aria-controls', 'solution-slide-quotes');
  await expect(tab('quotes')).toHaveAttribute('aria-selected', 'true');
  await expect(chip('quotes')).toHaveAttribute('aria-pressed', 'true');

  await chip('operations').click();
  await expect(panel('operations')).toHaveAttribute('data-active', 'true');
  await expect(panel('quotes')).toHaveAttribute('data-active', 'false');
  await expect(tab('operations')).toHaveAttribute('aria-selected', 'true');
  await expect(chip('operations')).toHaveAttribute('aria-pressed', 'true');
  await expect(chip('quotes')).toHaveAttribute('aria-pressed', 'false');

  await tab('documents').focus();
  await page.keyboard.press('End');
  await expect(tab('operations')).toBeFocused();
  await expect(panel('operations')).toHaveAttribute('data-active', 'true');

  await page.keyboard.press('Home');
  await expect(tab('quotes')).toBeFocused();
  await expect(panel('quotes')).toHaveAttribute('data-active', 'true');

  await page.keyboard.press('ArrowRight');
  await expect(tab('documents')).toBeFocused();
  await expect(panel('documents')).toHaveAttribute('data-active', 'true');

  if (testInfo.project.name === 'desktop') {
    await chip('operations').click();
    await page.waitForTimeout(8_300);
    await expect(panel('operations')).toHaveAttribute('data-active', 'true');
  }
});

test('keeps expanded ARM solutions contained across supported widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The width matrix runs once from the desktop project.');

  for (const width of [280, 320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
    await disclosure.locator('summary[data-arm-summary]').click();
    await expect(disclosure).toHaveAttribute('open', '');

    const layout = await disclosure.evaluate((element) => {
      const disclosureBox = element.getBoundingClientRect();
      const items = Array.from(element.querySelectorAll<HTMLElement>('[data-solution-id]')).map((item) => {
        const box = item.getBoundingClientRect();
        return { left: box.left, right: box.right };
      });

      return {
        disclosureLeft: disclosureBox.left,
        disclosureRight: disclosureBox.right,
        items,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    expect(layout.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(layout.viewportWidth);
    for (const item of layout.items) {
      expect(item.left, `${width}px item left`).toBeGreaterThanOrEqual(layout.disclosureLeft);
      expect(item.right, `${width}px item right`).toBeLessThanOrEqual(layout.disclosureRight);
    }

    await expect(disclosure).toHaveCSS('display', 'grid');
    await expect(disclosure.locator('.solution-disclosure__panel')).toHaveCSS('display', 'grid');
  }
});

test('keeps ARM disclosure keyboard order logical at mobile-390', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Keyboard order is covered at the primary mobile viewport.');

  await page.goto('/');

  const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  const summary = disclosure.locator('summary[data-arm-summary]');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');
  await summary.focus();

  // O tablist das bolinhas é UMA paragem de tabulação (roving tabindex): as setas
  // navegam lá dentro. Depois vêm os três chips, o CTA, e só então o link seguinte.
  await page.keyboard.press('Tab');
  await expect(disclosure.locator('[data-solution-dot="0"]')).toBeFocused();
  await expect(disclosure.locator('[data-solution-dot="1"]')).toHaveAttribute('tabindex', '-1');
  await expect(disclosure.locator('[data-solution-dot="2"]')).toHaveAttribute('tabindex', '-1');

  await page.keyboard.press('ArrowRight');
  await expect(disclosure.locator('[data-solution-dot="1"]')).toBeFocused();
  await expect(disclosure.locator('[data-solution-slide="1"]')).toHaveAttribute('data-active', 'true');
  await page.keyboard.press('Home');
  await expect(disclosure.locator('[data-solution-slide="0"]')).toHaveAttribute('data-active', 'true');

  for (let chip = 0; chip < 3; chip += 1) {
    await page.keyboard.press('Tab');
    await expect(disclosure.locator(`[data-solution-chip="${chip}"]`)).toBeFocused();
  }

  await page.keyboard.press('Tab');
  await expect(disclosure.locator('[data-arm-site]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-link-id="linkedin"]')).toBeFocused();
});

test('keeps at least 32px of black breathing room after GitHub on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop breathing room is calibrated at 1440 by 900.');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  await disclosure.locator('summary[data-arm-summary]').click();
  await expect(disclosure).toHaveAttribute('open', '');
  await page.locator('[data-link-id="github"]').scrollIntoViewIfNeeded();

  const breathingRoom = await page.locator('[data-link-id="github"]').evaluate((github) => {
    const githubBottom = window.scrollY + github.getBoundingClientRect().bottom;
    return document.documentElement.scrollHeight - githubBottom;
  });

  expect(breathingRoom).toBeGreaterThanOrEqual(32);
});

test('keeps the ARM disclosure action static when reduced motion is requested', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Disclosure reduced-motion behavior is covered once at the primary mobile viewport.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const disclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  const summary = page.locator(
    'details[data-solutions-disclosure][data-link-id="arm"] > summary[data-arm-summary]',
  );
  const actionIcon = page.locator(
    'details[data-solutions-disclosure][data-link-id="arm"] > summary[data-arm-summary] .link-card__action-icon',
  );
  const panel = disclosure.locator('.solution-disclosure__panel');
  await expect(disclosure).toHaveCount(1);
  await expect(summary).toHaveCount(1);
  await expect(actionIcon).toHaveCount(1);
  await expect(panel).toHaveCount(1);
  const chevron = actionIcon.locator('path');
  await expect(chevron).toHaveAttribute('d', 'm7 9 5 5 5-5');
  await expect(chevron).toHaveAttribute('stroke-linecap', 'round');
  await expect(chevron).toHaveAttribute('stroke-linejoin', 'round');
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(actionIcon).toHaveCSS('transform', 'none');

  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(disclosure).toHaveAttribute('open', '');

  const state = await page.evaluate(() => {
    const action = document.querySelector<HTMLElement>(
      'details[data-solutions-disclosure][data-link-id="arm"] > summary[data-arm-summary] .link-card__action-icon',
    );
    const panel = document.querySelector<HTMLElement>(
      'details[data-solutions-disclosure][data-link-id="arm"] .solution-disclosure__panel',
    );
    if (!action || !panel) throw new Error('O estado da divulgação ARM não está disponível.');

    const timingInSeconds = (element: HTMLElement) => {
      const styles = getComputedStyle(element);
      const maxTimingMagnitudeInSeconds = (value: string) =>
        Math.max(
          ...value.split(',').map((duration) => {
            const numericMagnitude = Math.abs(Number.parseFloat(duration));
            return duration.trim().endsWith('ms') ? numericMagnitude / 1000 : numericMagnitude;
          }),
        );

      return {
        animationDelay: maxTimingMagnitudeInSeconds(styles.animationDelay),
        animationDuration: maxTimingMagnitudeInSeconds(styles.animationDuration),
        transitionDelay: maxTimingMagnitudeInSeconds(styles.transitionDelay),
        transitionDuration: maxTimingMagnitudeInSeconds(styles.transitionDuration),
      };
    };

    return {
      actionTransform: getComputedStyle(action).transform,
      actionTiming: timingInSeconds(action),
      panelTiming: timingInSeconds(panel),
    };
  });

  expect(state.actionTransform).toBe('matrix(-1, 0, 0, -1, 0, 0)');
  for (const timing of [state.actionTiming, state.panelTiming]) {
    expect(timing.animationDuration).toBe(0);
    expect(timing.animationDelay).toBe(0);
    expect(timing.transitionDuration).toBe(0);
    expect(timing.transitionDelay).toBe(0);
  }
});

test('ends cleanly without a name sign-off', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.page-footer')).toHaveCount(0);
  await expect(page.locator('.page-divider')).toHaveCount(0);
  await expect(page.getByText('Julismo Costa', { exact: true })).toHaveCount(0);
});

test('keeps the full card keyboard-operable', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: /Falar comigo.*WhatsApp.*resposta direta/ }),
  ).toBeFocused();
  await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '66px');
});

test('keeps a global illuminated backdrop and a scaled decorative hero banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.profile-hero__banner')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute(
    'src',
    '/images/julismo-hero-banner.png',
  );
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('width', '1584');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('height', '396');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('alt', '');
  const edgeLayer = await page.locator('.profile-hero__banner').evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return { backgroundImage: styles.backgroundImage, height: styles.height };
  });
  expect(edgeLayer.backgroundImage).toContain('linear-gradient');
  expect(edgeLayer.height).not.toBe('0px');
  await expect(page.locator('.link-card__action')).toHaveCount(6);
  await expect(page.locator('.link-card__action').first()).toHaveAttribute('aria-hidden', 'true');
  const overlap = await page.locator('.profile-hero').evaluate((hero) => {
    const banner = hero.querySelector('.profile-hero__banner')!.getBoundingClientRect();
    const portrait = hero.querySelector('.profile-hero__image')!.getBoundingClientRect();
    const portraitCenter = portrait.left + portrait.width / 2;
    const bannerCenter = banner.left + banner.width / 2;
    return (
      Math.abs(portraitCenter - bannerCenter) < 1 &&
      portrait.top < banner.bottom &&
      portrait.bottom > banner.bottom
    );
  });

  expect(overlap).toBe(true);
  await expect(page.locator('img.verified-rosette')).toHaveAttribute(
    'src',
    '/images/julismo-verified-rosette-rounded.png',
  );
  await expect(page.locator('img.verified-rosette')).toHaveAttribute('alt', '');
  await expect(page.locator('img.verified-rosette')).toHaveAttribute('aria-hidden', 'true');
  const backdrop = await page.locator('body').evaluate((element) => {
    const styles = getComputedStyle(element, '::before');
    return { backgroundImage: styles.backgroundImage, position: styles.position };
  });
  expect(backdrop.position).toBe('fixed');
  expect(backdrop.backgroundImage).toContain('radial-gradient');
  await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '66px');
});

test('prevents horizontal overflow at narrow effective widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'This regression is specific to mobile-sized viewports.');

  for (const width of [280, 320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  }
});

test('keeps all six destinations ordered and secures external navigation', async ({ page }) => {
  await page.goto('/');

  const expectedLinks = [
    {
      id: 'whatsapp',
      href: 'https://api.whatsapp.com/send?phone=351933751885&text=Ol%C3%A1%2C%20Julismo.%20Vi%20o%20teu%20perfil%20e%20gostava%20de%20falar%20contigo.',
      external: false,
    },
    { id: 'cal', href: 'https://cal.com/julismo-costa-3nxpms/30min', external: true },
    { id: 'email', href: 'mailto:julismocosta@gmail.com', external: false },
    { id: 'linkedin', href: 'https://www.linkedin.com/in/julismocosta/', external: true },
    { id: 'github', href: 'https://github.com/julismo', external: true },
  ];

  for (const link of expectedLinks) {
    const card = page.locator(`[data-link-id="${link.id}"]`);
    await expect(card).toHaveAttribute('href', link.href);

    if (link.external) {
      await expect(card).toHaveAttribute('target', '_blank');
      await expect(card).toHaveAttribute('rel', 'noopener noreferrer');
    } else {
      await expect(card).not.toHaveAttribute('target', '_blank');
    }
  }

  const armDisclosure = page.locator('details[data-solutions-disclosure][data-link-id="arm"]');
  await expect(armDisclosure).not.toHaveAttribute('open', '');
  await armDisclosure.locator('summary[data-arm-summary]').click();
  const armSite = armDisclosure.locator('[data-arm-site]');
  await expect(armSite).toHaveAttribute('href', 'https://arm-lda.com/');
  await expect(armSite).toHaveAttribute('target', '_blank');
  await expect(armSite).toHaveAttribute('rel', 'noopener noreferrer');

  const bookingCard = page.locator('[data-link-id="cal"]');
  await expect(bookingCard).toHaveAttribute('href', 'https://cal.com/julismo-costa-3nxpms/30min');
  await expect(bookingCard).toHaveAttribute('target', '_blank');
  await expect(bookingCard).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(bookingCard).toHaveAttribute('data-cal-trigger', '');
  await expect(bookingCard).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(bookingCard).toHaveAttribute('aria-controls', 'cal-dialog');

  for (const id of ['whatsapp', 'arm', 'cal']) {
    const icon = page.locator(`[data-link-id="${id}"] .link-card__icon`);
    const shape = await icon.evaluate((element) => {
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return { borderRadius: styles.borderRadius, width: rect.width, height: rect.height };
    });
    expect(shape.borderRadius).toBe('50%');
    expect(shape.width).toBe(shape.height);
  }
  await expect(page.locator('[data-link-id="arm"] .link-card__icon')).not.toHaveClass(/link-card__icon--arm/);
});

test('has no horizontal overflow', async ({ page }) => {
  await page.goto('/');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('keeps the fixed backdrop visible after a real 390px mobile scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'This regression is specific to the 390 by 844 mobile viewport.');
  await page.goto('/');

  const initial = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  expect(initial.scrollHeight).toBeGreaterThan(initial.viewportHeight);
  expect(initial.horizontalOverflow).toBe(false);
  await page.screenshot({ path: 'output/playwright/banner-390-before-scroll.png', fullPage: false });

  await page.mouse.wheel(0, 240);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.screenshot({ path: 'output/playwright/banner-390-after-scroll.png', fullPage: false });

  const backdropPosition = await page.locator('body').evaluate((element) =>
    getComputedStyle(element, '::before').position,
  );
  expect(backdropPosition).toBe('fixed');
});

test('keeps the verification seal closely aligned', async ({ page }, testInfo) => {
  test.skip(
    !['mobile-390', 'desktop'].includes(testInfo.project.name),
    'The badge alignment is calibrated at the primary mobile and desktop viewports.',
  );
  await page.goto('/');

  const geometry = await page.locator('.profile-hero').evaluate((hero) => {
    const heading = hero.querySelector('h1')!.getBoundingClientRect();
    const badge = hero.querySelector('img.verified-rosette')!.getBoundingClientRect();
    return {
      headingCenter: heading.left + heading.width / 2,
      viewportCenter: window.innerWidth / 2,
      badgeGap: badge.left - heading.right,
      verticalDelta: Math.abs(
        badge.top + badge.height / 2 - (heading.top + heading.height / 2),
      ),
    };
  });

  expect(Math.abs(geometry.headingCenter - geometry.viewportCenter)).toBeLessThanOrEqual(1);
  expect(geometry.badgeGap).toBeGreaterThanOrEqual(5.5);
  expect(geometry.badgeGap).toBeLessThanOrEqual(6.5);
  expect(geometry.verticalDelta).toBeLessThanOrEqual(1);
});

test('Safari waits for an orientation sample before marking motion active', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Permission flow is covered once at mobile width.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'granted' });

  await page.goto('/');
  const consent = page.getByRole('button', { name: 'Ativar movimento' });

  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & { __motionPermissionRequests: string[] }).__motionPermissionRequests,
  )).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'permission-required');
  await expect(consent).toBeVisible();
  await consent.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & { __motionPermissionRequests: string[] }).__motionPermissionRequests,
  )).toEqual(['orientation', 'motion']);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'waiting');

  await page.evaluate(() => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent;
    window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 0 }));
    window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 24, gamma: 18 }));
  });

  await expect.poll(() => page.locator('[data-profile-plane]').evaluate((plane) => {
    const tilt = Number.parseFloat(plane.style.getPropertyValue('--tilt-x'));
    return Number.isFinite(tilt) && tilt !== 0;
  })).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'active');
  await expect(page.locator('[data-motion-status]')).toHaveText('Movimento ativado.');
  await expect(page.locator('[data-link-id="whatsapp"]')).toBeFocused();
});

test('moves the card plane visibly while the hero stays fixed in Safari', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Motion geometry is calibrated at the primary mobile viewport.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'granted' });
  await page.goto('/');

  const before = await page.locator('body').evaluate((body) => {
    const hero = body.querySelector<HTMLElement>('.profile-hero')!;
    const whatsapp = body.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;

    return {
      heroLeft: hero.getBoundingClientRect().left,
      whatsappLeft: whatsapp.getBoundingClientRect().left,
    };
  });

  await page.getByRole('button', { name: 'Ativar movimento' }).click();
  await page.evaluate(() => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent;
    window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 0 }));

    for (let index = 0; index < 12; index += 1) {
      window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 20 }));
    }
  });

  await expect.poll(() => page.locator('[data-profile-plane]').evaluate((plane) =>
    Number.parseFloat(plane.style.getPropertyValue('--shift-x')),
  )).toBeGreaterThanOrEqual(5);

  const after = await page.locator('body').evaluate((body) => {
    const hero = body.querySelector<HTMLElement>('.profile-hero')!;
    const whatsapp = body.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;

    return {
      heroLeft: hero.getBoundingClientRect().left,
      whatsappLeft: whatsapp.getBoundingClientRect().left,
    };
  });

  expect(after.whatsappLeft - before.whatsappLeft).toBeGreaterThanOrEqual(5);
  expect(Math.abs(after.heroLeft - before.heroLeft)).toBeLessThanOrEqual(1);
});

test('moves the card plane visibly without shifting the hero in Safari', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Motion geometry is calibrated at the primary mobile viewport.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'granted' });
  await page.goto('/');

  const before = await page.locator('body').evaluate((body) => {
    const hero = body.querySelector<HTMLElement>('.profile-hero')!;
    const whatsapp = body.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;

    return {
      heroLeft: hero.getBoundingClientRect().left,
      whatsappLeft: whatsapp.getBoundingClientRect().left,
    };
  });

  await page.getByRole('button', { name: 'Ativar movimento' }).click();
  await page.evaluate(() => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent;
    window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 0 }));

    for (let index = 0; index < 12; index += 1) {
      window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 20 }));
    }
  });

  await expect.poll(() => page.locator('[data-profile-plane]').evaluate((plane) =>
    Math.abs(Number.parseFloat(plane.style.getPropertyValue('--shift-x'))),
  )).toBeGreaterThan(0);

  const after = await page.locator('body').evaluate((body) => {
    const hero = body.querySelector<HTMLElement>('.profile-hero')!;
    const whatsapp = body.querySelector<HTMLElement>('[data-link-id="whatsapp"]')!;

    return {
      heroLeft: hero.getBoundingClientRect().left,
      whatsappLeft: whatsapp.getBoundingClientRect().left,
    };
  });

  expect(Math.abs(after.whatsappLeft - before.whatsappLeft)).toBeGreaterThan(0);
  expect(Math.abs(after.heroLeft - before.heroLeft)).toBeLessThanOrEqual(1);
});

test('reports unavailable motion when Safari grants permission but receives no sensor event', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Safari no-sensor feedback is covered once at mobile width.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'granted' });
  await page.goto('/');
  const initialConsent = page.getByRole('button', { name: 'Ativar movimento' });
  await initialConsent.focus();
  await page.keyboard.press('Enter');

  await expect.poll(() => page.locator('html').getAttribute('data-motion')).toBe('unavailable');

  const consent = page.getByRole('button', { name: 'Movimento indisponível' });
  await expect(consent).toBeVisible();
  await expect(consent).toBeDisabled();
  await expect(page.locator('[data-motion-status]')).toContainText('Abra esta página diretamente no Safari');
  await expect(page.locator('[data-link-id="whatsapp"]')).toBeFocused();

  const plane = page.locator('[data-profile-plane]');
  const motionVariables = await plane.evaluate((element) => ({
    tiltX: element.style.getPropertyValue('--tilt-x'),
    tiltY: element.style.getPropertyValue('--tilt-y'),
    shiftX: element.style.getPropertyValue('--shift-x'),
    shiftY: element.style.getPropertyValue('--shift-y'),
  }));

  await page.evaluate(() => {
    const OrientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent;
    window.dispatchEvent(new OrientationEvent('deviceorientation', { beta: 0, gamma: 20 }));
  });
  await page.evaluate(() => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve())));

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'unavailable');
  await expect(consent).toBeVisible();
  await expect(consent).toBeDisabled();
  await expect(consent).toHaveText('Movimento indisponível');
  await expect(page.locator('[data-motion-status]')).toContainText('Abra esta página diretamente no Safari');
  await expect(page.locator('[data-link-id="whatsapp"]')).toBeFocused();
  await expect(plane.evaluate((element) => ({
    tiltX: element.style.getPropertyValue('--tilt-x'),
    tiltY: element.style.getPropertyValue('--tilt-y'),
    shiftX: element.style.getPropertyValue('--shift-x'),
    shiftY: element.style.getPropertyValue('--shift-y'),
  }))).resolves.toEqual(motionVariables);
});

test('uses acceleration samples when iPhone does not emit orientation events', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Sensor fallback is covered once at mobile width.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'granted' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Ativar movimento' }).click();

  await page.evaluate(() => {
    const MotionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent;
    window.dispatchEvent(
      new MotionEvent('devicemotion', {
        accelerationIncludingGravity: { x: 0, y: 0, z: 9.81 },
      }),
    );
    window.dispatchEvent(
      new MotionEvent('devicemotion', {
        accelerationIncludingGravity: { x: 6, y: -4, z: 6 },
      }),
    );
  });

  await expect.poll(() => page.locator('[data-profile-plane]').evaluate((plane) => {
    const tilt = Number.parseFloat(plane.style.getPropertyValue('--tilt-x'));
    return Number.isFinite(tilt) && tilt !== 0;
  })).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'active');
});

test('keeps motion disabled when Safari permission is denied', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'Permission flow is covered once at mobile width.');

  await emulateSafariMotionPermissions(page, { orientation: 'granted', motion: 'denied' });
  await page.goto('/');

  const consent = page.getByRole('button', { name: 'Ativar movimento' });
  await expect(consent).toBeVisible();
  await consent.click();

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'denied');
  await expect(consent).toBeHidden();
  await expect(page.locator('[data-motion-status]')).toHaveText('Movimento não ativado.');
  await expect(page.locator('[data-link-id="whatsapp"]')).toBeFocused();
});

test('reduces motion when requested', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'no-js', 'The no-JS project does not run client motion enhancement.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const beamAnimation = await page
    .locator('.link-card--primary')
    .evaluate((element) => getComputedStyle(element, '::before').animationName);
  expect(beamAnimation).toBe('none');
});
