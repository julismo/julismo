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
  await expect(page.locator('.link-card').first()).toHaveCSS('min-height', '58px');
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
