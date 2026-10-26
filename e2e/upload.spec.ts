import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { access } from 'node:fs/promises';
import { test, expect, login, cleanupHeaders } from './helpers';

test('Upload, generated ALT text, and photo details on the global timeline', async ({ page, context, isMobile }, testInfo) => {
    test.setTimeout(180_000);

    const imagePath = resolve(process.env['E2E_IMAGE_PATH'] ?? 'images/template.jpg');
    await access(imagePath);

    await login(page);

    // A unique note lets us identify the post created by this run.
    const note = `Playwright regression ${randomUUID()}`;
    let attachmentUrl: string | undefined;
    let createdStatusUrl: string | undefined;

    // Capture successful writes immediately, so cleanup also runs after subsequent failures.
    const capture = async (response: import('@playwright/test').Response) => {
        const path = new URL(response.url()).pathname;
        if (response.request().method() !== 'POST' || !response.ok()) return;
        if (path === '/api/v1/attachments') {
            attachmentUrl = `${new URL(response.url()).origin}/api/v1/attachments/${(await response.json()).id}`;
        }
        if (path === '/api/v1/statuses') {
            const body = response.request().postDataJSON();
            if (body.note === note) {
                createdStatusUrl = `${new URL(response.url()).origin}/api/v1/statuses/${(await response.json()).id}`;
            }
        }
    };

    const writes: Promise<void>[] = [];
    page.on('response', response => writes.push(capture(response)));

    try {
        await test.step('Act: open upload from the navigation → Expected: the interactive upload form appears', async () => {
            // Stay in the Angular application initialized by login. A full page.goto()
            // can expose the SSR file input before Angular attaches its change handler.
            if (isMobile) {
                await page.locator('app-header .hamburger-menu').click();
            }

            await page.locator('a[href="/upload"]:visible').click();

            await expect(page).toHaveURL(/\/upload$/);
            await expect(page.locator('input[name="photography"]'), 'The account should be allowed to upload photos').toBeAttached();
        });

        await test.step('Act: select the test photo → Expected: the upload succeeds', async () => {
            // Image decoding and preprocessing happen before the upload request starts.
            // Allow for a slower headed browser, and await the action and response together.
            const [uploadResponse] = await Promise.all([
                page.waitForResponse(response =>
                    new URL(response.url()).pathname === '/api/v1/attachments' && response.request().method() === 'POST',
                { timeout: 45_000 }),
                page.locator('input[name="photography"]').setInputFiles(imagePath),
            ]);

            expect(uploadResponse.ok(), 'The photo upload should succeed').toBeTruthy();
        });

        const generatedAlt = await test.step('Act: generate ALT text → Expected: a nonempty description fills the ALT field', async () => {
            const alt = page.locator('app-upload-photo textarea[name^="altText-"]');
            await expect(alt).toBeVisible();

            await alt.fill('');

            const generate = page.locator('app-upload-photo button').filter({ has: page.locator('mat-icon', { hasText: 'smart_toy' }) });
            await expect(generate, 'ALT generation should be enabled on the server and in user preferences').toBeVisible();
            await expect(generate).toBeEnabled();

            const describeResponse = page.waitForResponse(response => /\/api\/v1\/attachments\/[^/]+\/describe$/.test(new URL(response.url()).pathname), { timeout: 90_000 });
            await generate.click();
            const description = await describeResponse;

            expect(description.ok(), 'The real AI service should generate ALT text successfully').toBeTruthy();

            const generatedAlt = (await description.json()).description as string;
            expect(generatedAlt.trim().length).toBeGreaterThan(0);
            await expect(alt).toHaveValue(generatedAlt);

            return generatedAlt;
        });

        const published = await test.step('Act: publish a public status → Expected: the status is created and the home page opens', async () => {
            await page.locator('app-upload-photo + div button').first().click();
            await page.locator('textarea[name="statusText"]').fill(note);
            const form = page.locator('app-upload form');
            // Public visibility is required for the global timeline, regardless of user preferences.
            await form.locator('mat-select').nth(1).click();
            await page.locator('mat-option').first().click();

            const publishResponse = page.waitForResponse(response =>
                new URL(response.url()).pathname === '/api/v1/statuses' && response.request().method() === 'POST');
            await form.locator(':scope > .flex-row.flex-space-between > div').first().locator('button').nth(1).click();
            const publishedResponse = await publishResponse;

            expect(publishedResponse.ok(), 'Publishing the status should succeed').toBeTruthy();

            const published = await publishedResponse.json();
            createdStatusUrl = `${new URL(publishedResponse.url()).origin}/api/v1/statuses/${published.id}`;
            await expect(page).toHaveURL(/\/(?:home)?(?:\?.*)?$/);

            return published;
        });

        await test.step('Act: find the new photo on the global timeline and open it', async () => {
            await page.goto('/home?t=global');
            const link = page.locator(`app-gallery a.gallery-link[href="/statuses/${published.id}"]`);
            await expect(link, 'The new status should appear on the global timeline').toBeVisible();
            await link.click();
        });

        await test.step('Expected: the status page shows the uploaded photo, note, and generated ALT text', async () => {
            await expect(page).toHaveURL(new RegExp(`/statuses/${published.id}$`));
            await expect(page.locator('app-status #note')).toHaveText(note);

            const image = page.locator('app-status .photo-image-container img');
            await expect(image).toBeVisible();
            await expect(image).toHaveAttribute('alt', generatedAlt);
            await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBeTruthy();
        });

        await test.step('Expected: the API preserves the author, visibility, attachment, and ALT text', async () => {
            const savedResponse = await context.request.get(createdStatusUrl!);
            expect(savedResponse.ok()).toBeTruthy();

            const saved = await savedResponse.json();
            expect(saved.user.userName).toBe(process.env['E2E_USERNAME'] ?? 'admin');
            expect(saved.note).toBe(note);
            expect(saved.visibility).toBe('public');
            expect(saved.attachments).toHaveLength(1);
            expect(saved.attachments[0].description).toBe(generatedAlt);
            expect(saved.attachments[0].id).toBe(published.attachments[0].id);
        });

    } finally {
        await test.step('Cleanup: delete only the post or temporary attachment created by this test', async () => {
            await Promise.all(writes);

            const target = createdStatusUrl ?? attachmentUrl;

            if (target) {
                // Keep the address in the report in case cleanup fails and needs manual attention.
                await testInfo.attach('cleanup-target', { body: target, contentType: 'text/plain' });

                const response = await context.request.delete(target, { headers: await cleanupHeaders(page) });

                expect(response.ok(), `Deleting data created by this test should succeed: ${target}`).toBeTruthy();
            }
        });
    }
});
