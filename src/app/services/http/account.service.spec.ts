import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SsrCookieService } from '../common/ssr-cookie.service';
import { WindowService } from '../common/window.service';
import { AccountService } from './account.service';

describe('AccountService', () => {
    let accountService: AccountService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AccountService,
                { provide: PLATFORM_ID, useValue: 'server' },
                { provide: SsrCookieService, useValue: { get: () => 'refresh-token-value' } },
                { provide: WindowService, useValue: { apiUrl: () => 'https://vernissage.photos' } },
            ]
        });

        accountService = TestBed.inject(AccountService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('requests tokens in the response body during SSR', async () => {
        const refreshPromise = accountService.refreshToken();
        const request = httpTestingController.expectOne('https://vernissage.photos/api/v1/account/refresh-token');

        expect(request.request.body).toEqual({
            refreshToken: 'refresh-token-value',
            regenerateRefreshToken: false,
            useCookies: false,
        });

        request.flush({
            accessToken: 'new-access-token',
            expirationDate: new Date(Date.now() + 60_000).toISOString(),
            userPayload: { locale: 'en-US' },
        });

        await expect(refreshPromise).resolves.toMatchObject({ accessToken: 'new-access-token' });
    });
});
