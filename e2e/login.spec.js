const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Booking System' })).toBeVisible();
});

test('shows the sign-in screen to a signed-out visitor', async ({ page }) => {
    await expect(page.getByText('Sign in to your account')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
});

test('validates the form before contacting Firebase', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    await page.getByLabel('Email Address').fill('alex');
    await page.getByLabel('Password', { exact: true }).fill('secret');
    await page.getByLabel('Password', { exact: true }).press('Enter');
    await expect(page.getByText('Invalid email format')).toBeVisible();
});

test('switches to sign up and enforces the password length', async ({ page }) => {
    await page.getByRole('button', { name: /don't have an account/i }).click();
    await expect(page.getByText('Create your account to get started')).toBeVisible();

    await page.getByLabel('Email Address').fill('alex@example.com');
    await page.getByLabel('Password', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();

    await page.getByRole('button', { name: /already have an account/i }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('reveals and hides the password', async ({ page }) => {
    const password = page.getByLabel('Password', { exact: true });
    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(password).toHaveAttribute('type', 'password');
});

test('fits the viewport without horizontal scrolling', async ({ page }) => {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
});

test('serves deep links through the single-page app', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: 'Booking System' })).toBeVisible();
});
