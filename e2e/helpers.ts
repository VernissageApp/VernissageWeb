import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';
import { JSDOM } from 'jsdom';

export const apiUrl = process.env['E2E_API_URL'] ?? 'http://localhost:8080';
export const profilePath = process.env['E2E_PROFILE_PATH'] ?? '/@admin';
export const statusId = process.env['E2E_STATUS_ID'] ?? '7618508410933219959';

// Fail on browser exceptions and unexpected server failures, without reading server logs.
export const test = base.extend<{ browserHealth: void }>({
    browserHealth: [async ({ page, baseURL }, use) => {
        const errors: string[] = [];

        page.on('pageerror', error => errors.push(error.stack ?? error.message));
        page.on('response', response => {
            const origin = new URL(response.url()).origin;
            if ([new URL(baseURL!).origin, new URL(apiUrl).origin].includes(origin) && response.status() >= 500) {
                errors.push(`${response.status()} ${response.url()}`);
            }
        });
        await use();

        // Expected: the scenario completes without browser exceptions or server failures.
        expect(errors, 'No unhandled JavaScript errors or HTTP 5xx responses').toEqual([]);
    }, { auto: true }],
});

export { expect };

export async function login(page: Page): Promise<void> {
    await test.step('Act: open the login page and enter credentials', async () => {
        await page.goto('/login');

        // SSR controls may appear before Angular attaches their event handlers.
        // Wait for the form to react to input instead of adding a fixed delay.
        await expect(async () => {
            await page.locator('input[name="userNameOrEmail"]').fill(process.env['E2E_USERNAME'] ?? 'admin');
            await page.locator('input[name="password"]').fill(process.env['E2E_PASSWORD'] ?? 'admin');

            // Expected: Angular has accepted both fields and the form is valid.
            await expect(page.locator('app-login form')).toHaveClass(/ng-valid/, { timeout: 500 });
        }).toPass({ timeout: 15_000, intervals: [250, 500] });
    });

    await test.step('Act: submit the form → Expected: the signed-in timeline opens', async () => {
        const responsePromise = page.waitForResponse(response =>
            new URL(response.url()).pathname === '/api/v1/account/login' && response.request().method() === 'POST');

        await page.locator('app-login button[type="submit"]').click();
        const response = await responsePromise;

        expect(response.ok(), 'Signing in with the configured credentials should succeed').toBeTruthy();
        await expect(page).toHaveURL(/\/home(?:\?|$)/);
        await expect(page.locator('app-home-signin mat-button-toggle-group')).toBeVisible();
    });
}

export async function getJson<T>(request: APIRequestContext, path: string): Promise<T> {
    const response = await request.get(`${apiUrl}${path}`);

    expect(response.ok(), `API request should succeed: ${path}`).toBeTruthy();
    return await response.json() as T;
}

// JSDOM does not execute scripts: these assertions examine only the original SSR HTML.
export async function serverDocument(request: APIRequestContext, path: string): Promise<Document> {
    const response = await request.get(path);

    expect(response.status(), `SSR ${path}`).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');

    return new JSDOM(await response.text()).window.document;
}

export function meta(document: Document, property: string): string {
    const elements = document.querySelectorAll(`meta[property="${property}"]`);
    expect(elements.length, `SSR HTML should contain exactly one ${property} tag`).toBe(1);
    return elements[0].getAttribute('content') ?? '';
}

export function plainText(html: string): string {
    return new JSDOM(`<body>${html}</body>`).window.document.body.textContent ?? '';
}

export async function cleanupHeaders(page: Page): Promise<Record<string, string>> {
    return { 'X-XSRF-TOKEN': await page.evaluate(() => localStorage.getItem('xsrf-token') ?? 'unknown') };
}
