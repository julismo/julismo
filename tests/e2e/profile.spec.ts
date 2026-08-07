import { expect, test } from '@playwright/test';

test('uses a desktop banner focal point without changing the mobile crop', async ({ page }, testInfo) => {
  await page.goto('/');
  const objectPosition = await page.locator('.profile-hero__banner img').evaluate(
    (image) => getComputedStyle(image).objectPosition,
  );

  if (testInfo.project.name === 'desktop' || testInfo.project.name === 'tablet-768') {
    expect(objectPosition).toBe('50% 76%');
  }

  if (testInfo.project.name === 'mobile-320' || testInfo.project.name === 'mobile-390' || testInfo.project.name === 'no-js') {
    expect(objectPosition).toBe('100% 50%');
  }
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
  await expect.poll(() => pageErrors).toEqual([]);
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

test('renders the approved identity and six complete action cards', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Julismo' })).toBeVisible();
  await expect(
    page.getByText('Simplifico processos que atrasam a equipa, sem trocar o que já funciona.'),
  ).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(6);
  await expect(
    page.getByRole('link', { name: /Falar comigo.*WhatsApp.*resposta direta/ }),
  ).toHaveAttribute('href', 'https://api.whatsapp.com/send?phone=351933751885');
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
    { id: 'whatsapp', href: 'https://api.whatsapp.com/send?phone=351933751885', external: false },
    { id: 'cal', href: 'https://cal.com/julismo-costa-3nxpms/30min', external: true },
    { id: 'arm', href: 'https://arm-lda.com/', external: true },
    { id: 'email', href: 'mailto:julismocosta@gmail.com', external: false },
    { id: 'github', href: 'https://github.com/julismo', external: true },
    { id: 'x', href: 'https://x.com/_Julismo', external: true },
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

test('centres the Julismo heading independently from its verification badge', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390', 'This composition is calibrated at the primary mobile viewport.');
  await page.goto('/');

  const geometry = await page.locator('.profile-hero').evaluate((hero) => {
    const heading = hero.querySelector('h1')!.getBoundingClientRect();
    const badge = hero.querySelector('img.verified-rosette')!.getBoundingClientRect();
    return {
      headingCenter: heading.left + heading.width / 2,
      viewportCenter: window.innerWidth / 2,
      headingRight: heading.right,
      badgeLeft: badge.left,
    };
  });

  expect(Math.abs(geometry.headingCenter - geometry.viewportCenter)).toBeLessThanOrEqual(1);
  expect(geometry.badgeLeft).toBeGreaterThan(geometry.headingRight + 6);
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
