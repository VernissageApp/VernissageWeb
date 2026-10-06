import { test, expect, getJson, serverDocument, meta, plainText, profilePath, statusId } from './helpers';

interface User {
    userName: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
}

interface Status {
    id: string;
    note: string;
    user: User;
    category?: { name: string };
    attachments: { smallFile: { url: string; width: number; height: number } }[];
}

test('SSR and Open Graph: user profile in the original HTML', async ({ request, baseURL }) => {
    const user = await getJson<User>(request, `/api/v1/users/${profilePath.slice(1)}`);
    expect(user.userName).toBe(profilePath.slice(2));

    const document = await test.step('Act: request the profile HTML without executing JavaScript', () =>
        serverDocument(request, profilePath));

    await test.step('Expected: the profile name and username are rendered by the server', async () => {
        expect(document.querySelector('app-profile h1')?.textContent?.trim()).toBe(user.name || user.userName);
        expect(document.querySelector('app-profile h4')?.textContent?.trim()).toBe(`@${user.userName}`);
    });

    const title = `${user.name ?? ''} (@${user.userName})`;

    await test.step('Expected: the title and Open Graph tags match the current profile data', async () => {
        expect(document.title).toBe(title);
        expect(meta(document, 'og:title')).toBe(title);
        expect(meta(document, 'og:url')).toBe(new URL(profilePath, baseURL).href);
        expect(meta(document, 'og:type')).toBe('website');
        expect(meta(document, 'og:description')).toBe(plainText(user.bio ?? ''));
        expect(meta(document, 'og:image')).toBe(user.avatarUrl ?? '');
    });
});

test('SSR and Open Graph: status in the original HTML', async ({ request, baseURL }) => {
    const status = await getJson<Status>(request, `/api/v1/statuses/${statusId}`);
    expect(status.id).toBe(statusId);
    expect(status.attachments.length, 'The reference status should contain a photo').toBeGreaterThan(0);

    const document = await test.step('Act: request the status HTML without executing JavaScript', () =>
        serverDocument(request, `/statuses/${statusId}`));

    await test.step('Expected: the status text and photo are rendered by the server', async () => {
        expect(document.querySelector('app-status #note')?.textContent?.trim()).toBe(plainText(status.note).trim());
        expect(document.querySelector('app-status .photo-image-container img')).not.toBeNull();
    });

    const author = `${status.user.name ?? ''} (@${status.user.userName})`;
    const category = status.category?.name.trim();
    const title = category ? `${category} by ${author}` :
        `${status.attachments.length === 1 ? 'One image' : `${status.attachments.length} images`} by ${author}`;

    await test.step('Expected: Open Graph identifies this status and its photo', async () => {
        expect(document.title).toBe(title);
        expect(meta(document, 'og:title')).toBe(title);
        expect(meta(document, 'og:url')).toBe(new URL(`/@${status.user.userName}/${statusId}`, baseURL).href);
        expect(meta(document, 'og:type')).toBe('website');
        expect(meta(document, 'og:description')).toBe(plainText(status.note));
        expect(meta(document, 'og:image')).toBe(status.attachments[0].smallFile.url);
        expect(meta(document, 'og:image:width')).toBe(String(status.attachments[0].smallFile.width));
        expect(meta(document, 'og:image:height')).toBe(String(status.attachments[0].smallFile.height));
    });
});

for (const route of [
    { path: '/', selector: 'app-home-signout .header' },
    { path: profilePath, selector: 'app-profile h4', text: profilePath.slice(1) },
    { path: `/statuses/${statusId}`, selector: 'app-status #note' },
]) {
    test(`SSR and three reloads: ${route.path}`, async ({ page, request }) => {
        const text = await test.step('Act: request the original HTML → Expected: the page content is server-rendered', async () => {
            const document = await serverDocument(request, route.path);
            const serverText = document.querySelector(route.selector)?.textContent?.trim();

            expect(serverText, 'The content should already exist in the SSR HTML').toBeTruthy();

            if (route.text) {
                expect(serverText).toBe(route.text);
            }

            return serverText!;
        });

        for (let attempt = 0; attempt <= 3; attempt++) {
            const action = attempt === 0 ? 'open the page' : `reload the page (${attempt}/3)`;

            await test.step(`Act: ${action} → Expected: the same content remains visible`, async () => {
                if (attempt === 0) {
                    await page.goto(route.path);
                } else {
                    await page.reload();
                }

                await expect(page.locator(route.selector)).toBeVisible();
                await expect(page.locator(route.selector)).toHaveText(text);
                await expect(page.locator('app-page-not-found, app-unexpected-error, app-connection-lost')).toHaveCount(0);

                // Finish this document's requests before deliberately reloading it.
                // The content assertions above are the actual readiness checks.
                await page.waitForLoadState('networkidle');
            });
        }
    });
}
