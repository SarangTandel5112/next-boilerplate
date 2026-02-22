import assert from 'node:assert';
import { expect, test } from '@playwright/test';

test.describe('Counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/counter');
  });

  test.describe('Initial load', () => {
    test('displays counter with initial value', async ({ page }) => {
      await expect(page.getByText(/Count:/)).toBeVisible();
      await expect(
        page.locator('form').getByRole('button', { name: /Increment/i }),
      ).toBeVisible();
    });

    test('shows increment form', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Increment/i }),
      ).toBeVisible();
    });
  });

  test.describe('Increment operation', () => {
    test('displays validation error when incrementing with negative number', async ({
      page,
    }) => {
      const count = page.getByText(/Count:/);
      const countText = await count.textContent();

      assert(countText !== null, 'Count should not be null');

      await page.getByLabel('Increment by').fill('-1');
      await page.getByRole('button', { name: 'Increment' }).click();

      await expect(
        page.getByText('Value must be between 1 and 3'),
      ).toBeVisible();
      await expect(page.getByText(/Count:/)).toHaveText(countText);
    });

    test('increments counter when button clicked', async ({ page }) => {
      const count = page.getByText(/Count:/);
      const countText = await count.textContent();

      assert(countText !== null, 'Count should not be null');

      const countNumber = Number(countText.split(' ')[1]);

      await page.getByLabel('Increment by').fill('2');
      await page.getByRole('button', { name: 'Increment' }).click();

      await expect(page.getByText(/Count:/)).toHaveText(
        `Count: ${countNumber + 2}`,
      );

      await page.getByLabel('Increment by').fill('3');
      await page.getByRole('button', { name: 'Increment' }).click();

      await expect(page.getByText(/Count:/)).toHaveText(
        `Count: ${countNumber + 5}`,
      );
    });

    test('disables button during loading', async ({ page }) => {
      const button = page.getByRole('button', { name: /Increment/i });

      await button.click();

      await expect(button).toBeDisabled();
    });
  });
});
