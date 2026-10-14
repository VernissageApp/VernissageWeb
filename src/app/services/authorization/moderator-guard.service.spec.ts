import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Role } from '../../models/role';
import { routes } from '../../pages/app.routes';
import { AuthorizationService } from './authorization.service';

@Component({ template: 'Requested page' })
class RequestedTestPage {}

@Component({ template: 'Access forbidden' })
class ForbiddenTestPage {}

@Component({ template: 'Login' })
class LoginTestPage {}

describe('role-protected route permissions', () => {
    const moderatorUrls = [
        '/articles',
        '/articles/create',
        '/articles/7693422467460630551',
        '/users',
        '/reports',
        '/error-items',
        '/activity-pub-events',
        '/activity-pub-events/7693422467460630551/items'
    ];
    const ownerAccessibleUrls = [
        '/statuses/7693422467460630551/events',
        '/statuses/7693422467460630551/events/7693422467460630552/items'
    ];
    let loggedIn: boolean;
    let roles: Role[];
    const signOut = vi.fn(async () => undefined);

    beforeEach(() => {
        loggedIn = true;
        roles = [];
        signOut.mockClear();

        // Keep the production guards and paths, replacing only page rendering.
        const testedRoutes = routes
            .filter(route => route.path === 'articles' || route.path?.startsWith('articles/')
                || route.path === 'news' || route.path === 'news/:id'
                || ['users', 'reports', 'error-items', 'settings', 'activity-pub-events',
                    'activity-pub-events/:eventId/items', 'statuses/:id/events',
                    'statuses/:id/events/:eventId/items'].includes(route.path ?? ''))
            .map(route => ({ ...route, loadComponent: async () => RequestedTestPage }));

        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    ...testedRoutes,
                    { path: 'access-forbidden', component: ForbiddenTestPage },
                    { path: 'login', component: LoginTestPage }
                ]),
                {
                    provide: AuthorizationService,
                    useValue: {
                        isLoggedIn: vi.fn(async () => loggedIn),
                        hasRole: vi.fn((role: Role) => roles.includes(role)),
                        signOut
                    }
                }
            ]
        });
    });

    for (const url of [...moderatorUrls, '/settings']) {
        it(`blocks a regular member from ${url}`, async () => {
            roles = [Role.Member];
            const harness = await RouterTestingHarness.create();

            await harness.navigateByUrl(url, ForbiddenTestPage);

            expect(TestBed.inject(Router).url).toBe('/access-forbidden');
            expect(signOut).not.toHaveBeenCalled();
        });

        it(`redirects an anonymous visitor from ${url} to login`, async () => {
            loggedIn = false;
            const harness = await RouterTestingHarness.create();

            await harness.navigateByUrl(url);

            const router = TestBed.inject(Router);
            expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe(url);
            expect(router.url.split('?')[0]).toBe('/login');
            expect(signOut).toHaveBeenCalledOnce();
        });

        for (const role of [Role.Administrator, Role.Moderator]) {
            const allowed = url !== '/settings' || role === Role.Administrator;
            it(`${allowed ? 'allows' : 'blocks'} ${role} on ${url}`, async () => {
                roles = [role];
                const harness = await RouterTestingHarness.create();

                await harness.navigateByUrl(url, allowed ? RequestedTestPage : ForbiddenTestPage);

                expect(TestBed.inject(Router).url).toBe(allowed ? url : '/access-forbidden');
            });
        }
    }

    it('checks administrator permission after refreshing the session', async () => {
        roles = [Role.Administrator];
        const authorizationService = TestBed.inject(AuthorizationService);
        vi.mocked(authorizationService.isLoggedIn).mockImplementation(async () => {
            roles = [Role.Moderator];
            return true;
        });
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/settings', ForbiddenTestPage);

        expect(TestBed.inject(Router).url).toBe('/access-forbidden');
    });

    for (const url of ownerAccessibleUrls) {
        it(`lets members reach the ownership check on ${url}`, async () => {
            roles = [Role.Member];
            const harness = await RouterTestingHarness.create();

            await harness.navigateByUrl(url, RequestedTestPage);

            expect(TestBed.inject(Router).url).toBe(url);
        });
    }

    it('checks roles after refreshing the session', async () => {
        roles = [Role.Moderator];
        const authorizationService = TestBed.inject(AuthorizationService);
        vi.mocked(authorizationService.isLoggedIn).mockImplementation(async () => {
            roles = [Role.Member];
            return true;
        });
        const harness = await RouterTestingHarness.create();

        await harness.navigateByUrl('/articles/7693422467460630551', ForbiddenTestPage);

        expect(TestBed.inject(Router).url).toBe('/access-forbidden');
    });

    for (const url of ['/news', '/news/7693422467460630551']) {
        it(`keeps ${url} accessible without a management role`, async () => {
            loggedIn = false;
            const harness = await RouterTestingHarness.create();

            await harness.navigateByUrl(url, RequestedTestPage);

            expect(TestBed.inject(Router).url).toBe(url);
            expect(signOut).not.toHaveBeenCalled();
        });
    }
});
