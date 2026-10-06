import { test, expect, login } from './helpers';

test('Returning from a photo restores the global timeline position', async ({ page, isMobile }) => {
    await login(page);

    await test.step('Act: open the global timeline → Expected: photos are visible', async () => {
        await page.goto('/home?t=global');

        await expect(page.locator('app-gallery a.gallery-link').first()).toBeVisible();
    });

    await test.step('Act: scroll down → Expected: the timeline moves away from the top', async () => {
        await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));

        await expect.poll(() => page.evaluate(() => window.scrollY), {
            message: 'The timeline should contain enough photos to scroll down',
        }).toBeGreaterThan(200);
    });

    // Choose a point that is already on screen so clicking does not change the scroll position.
    // A portrait photo may be taller than the mobile viewport; a visible fragment is enough.
    const selected = await page.locator('app-gallery a.gallery-link').evaluateAll(links => {
        const visible = links.find(link => {
            const rect = link.getBoundingClientRect();
            return Math.min(rect.bottom, window.innerHeight - 40) - Math.max(rect.top, 100) > 100;
        });

        if (!visible) return undefined;

        const rect = visible.getBoundingClientRect();

        return {
            href: visible.getAttribute('href'),
            x: rect.width / 2,
            y: (Math.max(rect.top, 100) + Math.min(rect.bottom, window.innerHeight - 40)) / 2 - rect.top,
        };
    });

    expect(selected?.href, 'Part of a photo should be visible in the scrolled timeline').toBeTruthy();

    const href = selected!.href;
    const link = page.locator(`app-gallery a.gallery-link[href="${href}"]`).first();

    await expect(link.locator('img')).toBeVisible();

    // Remember both the page scroll and this particular photo's position on screen.
    const position = await page.evaluate(() => window.scrollY);
    const box = await link.boundingBox();

    expect(box).not.toBeNull();

    await test.step('Act: open the visible photo → Expected: its status page opens', async () => {
        await link.click({ position: { x: selected!.x, y: selected!.y } });

        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.locator('app-status #note')).toBeVisible();
    });

    await test.step('Act: go back → Expected: the global timeline returns to the same position', async () => {
        if (isMobile) {
            // The mobile status page uses browser history instead of the desktop Back control.
            await page.goBack();
        } else {
            await page.locator('app-status .back-container').click();
        }

        await expect(page).toHaveURL(/\/home\?t=global$/);
        await expect.poll(async () => Math.abs(await page.evaluate(() => window.scrollY) - position)).toBeLessThanOrEqual(5);
        await expect(link).toBeVisible();
        await expect.poll(async () => Math.abs((await link.boundingBox())!.y - box!.y)).toBeLessThanOrEqual(5);
    });

    await test.step('Expected: the restored position stays stable after images and layout settle', async () => {
        // A second check catches delayed jumps after the initial restoration.
        await page.waitForTimeout(1000);

        expect(Math.abs(await page.evaluate(() => window.scrollY) - position)).toBeLessThanOrEqual(5);
        expect(Math.abs((await link.boundingBox())!.y - box!.y)).toBeLessThanOrEqual(5);
    });
});
