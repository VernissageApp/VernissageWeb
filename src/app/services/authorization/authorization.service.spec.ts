import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserPayloadToken } from '../../models/user-payload-token';
import { UserPayload } from '../../models/user-payload';
import { LanguageService } from '../common/language.service';
import { AccountService } from '../http/account.service';
import { PersistenceService } from '../persistance/persistance.service';
import { AuthorizationService } from './authorization.service';
import { SsrAccessTokenService } from './ssr-access-token.service';

describe('AuthorizationService during SSR', () => {
    let authorizationService: AuthorizationService;
    let ssrAccessTokenService: SsrAccessTokenService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthorizationService,
                SsrAccessTokenService,
                { provide: PLATFORM_ID, useValue: 'server' },
                { provide: AccountService, useValue: {} },
                {
                    provide: PersistenceService,
                    useValue: {
                        get: vi.fn(() => null),
                        set: vi.fn(),
                        remove: vi.fn(),
                    }
                },
                { provide: LanguageService, useValue: { setLanguageFromLocale: vi.fn(async () => undefined) } },
            ]
        });

        authorizationService = TestBed.inject(AuthorizationService);
        ssrAccessTokenService = TestBed.inject(SsrAccessTokenService);
    });

    it('uses the returned access token without starting a session timer', async () => {
        const initSessionTimeout = vi.spyOn(
            authorizationService as unknown as { initSessionTimeout: (seconds: number) => void },
            'initSessionTimeout'
        );
        const token = createToken('new-access-token');

        await expect(authorizationService.signIn(token)).resolves.toBe(true);

        expect(ssrAccessTokenService.get()).toBe('new-access-token');
        expect(initSessionTimeout).not.toHaveBeenCalled();
    });

    it('does not create an authenticated SSR state without an access token', async () => {
        const token = createToken();

        await expect(authorizationService.signIn(token)).resolves.toBe(false);

        expect(authorizationService.getUser()).toBeUndefined();
        expect(ssrAccessTokenService.get()).toBeUndefined();
    });
});

function createToken(accessToken?: string): UserPayloadToken {
    const expirationDate = new Date(Date.now() + 60_000).toISOString();
    const userPayload = { locale: 'en-US' } as UserPayload;

    return new UserPayloadToken(expirationDate, undefined, userPayload, accessToken);
}
