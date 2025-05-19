import { test, expect } from '@playwright/test';

const cardTitles = [
  'Curiosity',
  'Methods',
  'Maps',
  'Galileo',
  'Abacus-Cost',
  'How To',
];

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders all dashboard cards', async ({ page }) => {
    for (const title of cardTitles) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test('navigates to Methods when card clicked', async ({ page }) => {
    await page.getByText('Methods').click();
    await expect(page).toHaveURL(/methodologies/);
  });
});
