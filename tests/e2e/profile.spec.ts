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
