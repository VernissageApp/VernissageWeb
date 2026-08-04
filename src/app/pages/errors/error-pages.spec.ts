import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESPONSE } from 'express.tokens';

import { PersistenceService } from '../../services/persistance/persistance.service';
import { AccessForbiddenPage } from './access-forbidden/access-forbidden.page';
import { PageNotFoundPage } from './page-not-found/page-not-found.page';
import { UnexpectedErrorPage } from './unexpected-error/unexpected-error.page';

describe('SSR error pages', () => {
    const navigate = vi.fn();
    const status = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        navigate.mockReset();
        status.mockReset();

        TestBed.configureTestingModule({
            providers: [
                { provide: PLATFORM_ID, useValue: 'server' },
                { provide: Router, useValue: { navigate } },
                { provide: RESPONSE, useValue: { status } },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: { get: vi.fn(() => null) } } }
                },
                {
                    provide: PersistenceService,
                    useValue: { get: vi.fn(() => null), remove: vi.fn() }
                }
            ]
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sets HTTP 404 and does not redirect the page-not-found view', () => {
        const component = TestBed.runInInjectionContext(() => new PageNotFoundPage());

        component.ngOnInit();
        vi.advanceTimersByTime(6_000);

        expect(status).toHaveBeenCalledWith(404);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('does not redirect the access-forbidden view', () => {
        const component = TestBed.runInInjectionContext(() => new AccessForbiddenPage());

        component.ngOnInit();
        vi.advanceTimersByTime(6_000);

        expect(navigate).not.toHaveBeenCalled();
    });

    it('does not redirect the unexpected-error view', () => {
        const component = TestBed.runInInjectionContext(() => new UnexpectedErrorPage());

        component.ngOnInit();
        vi.advanceTimersByTime(6_000);

        expect(navigate).not.toHaveBeenCalled();
    });
});
