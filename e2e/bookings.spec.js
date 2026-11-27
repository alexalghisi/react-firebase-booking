const { test, expect } = require('@playwright/test');

const signUp = async (page, testInfo) => {
    const email = `e2e-${testInfo.project.name}-${Date.now()}-${testInfo.workerIndex}@example.com`;
    await page.goto('/');
    await page.getByRole('button', { name: /don't have an account/i }).click();
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('secret123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    return email;
};

const fillBooking = async (dialog, { title, date, time, duration }) => {
    await dialog.getByLabel(/^Title/).fill(title);
    await dialog.getByLabel(/^Date/).fill(date);
    await dialog.getByLabel(/^Time/).fill(time);
    if (duration) {
        await dialog.getByLabel('Duration').selectOption(String(duration));
    }
};

test('signs up, creates a booking and blocks an overlapping one', async ({ page }, testInfo) => {
    await signUp(page, testInfo);

    await page.getByRole('button', { name: 'New Booking' }).click();
    let dialog = page.getByRole('dialog', { name: 'Create New Booking' });
    await fillBooking(dialog, { title: 'Design review', date: '2030-05-14', time: '09:30', duration: 60 });
    await dialog.getByRole('button', { name: 'Create Booking' }).click();
    await expect(dialog).toBeHidden();

    await page.goto('/bookings');
    await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();
    await expect(page.getByText('Design review').first()).toBeVisible();

    await page.getByRole('button', { name: 'New Booking' }).click();
    dialog = page.getByRole('dialog', { name: 'Create New Booking' });
    await fillBooking(dialog, { title: 'Clash', date: '2030-05-14', time: '10:00', duration: 30 });
    await dialog.getByRole('button', { name: 'Create Booking' }).click();
    await expect(dialog.getByRole('alert')).toHaveText(
        'This time overlaps with Design review (2030-05-14 09:30). Pick another time or cancel the other booking.'
    );

    await dialog.getByLabel(/^Time/).fill('10:30');
    await expect(dialog.getByRole('alert')).toBeHidden();
    await dialog.getByRole('button', { name: 'Create Booking' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Clash').first()).toBeVisible();
});

test('closes the booking dialog with Escape', async ({ page }, testInfo) => {
    await signUp(page, testInfo);

    await page.getByRole('button', { name: 'New Booking' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Booking' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
});
