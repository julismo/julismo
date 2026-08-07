import { expect, test } from '@playwright/test';

test('renders the approved identity and five complete action cards', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Julismo' })).toBeVisible();
  await expect(
    page.getByText('Simplifico processos que atrasam a equipa, sem trocar o que já funciona.'),
  ).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(5);
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
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('src', '/images/julismo-hero-wave.png');
  await expect(page.locator('.profile-hero__banner img')).toHaveAttribute('alt', '');
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

test('keeps all five destinations ordered and secures external navigation', async ({ page }) => {
  await page.goto('/');

  const expectedLinks = [
    { id: 'whatsapp', href: 'https://api.whatsapp.com/send?phone=351933751885', external: false },
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
});

test('has no horizontal overflow', async ({ page }) => {
  await page.goto('/');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
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
