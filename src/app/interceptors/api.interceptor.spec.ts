import { HttpRequest, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthorizationService } from '../services/authorization/authorization.service';
import { LanguageService } from '../services/common/language.service';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PLATFORM_ID, useValue: 'browser' },
                {
                    provide: AuthorizationService,
                    useValue: {
                        getXsrfToken: vi.fn(() => 'xsrf-token'),
                        refreshAccessToken: vi.fn(),
                    },
                },
                { provide: LanguageService, useValue: { getAcceptLanguage: vi.fn(() => 'en-US') } },
            ],
        });
    });

    it('bypasses the service worker for FormData requests in the browser', () => {
        const formData = new FormData();
        formData.append('file', new Blob(['photo'], { type: 'image/png' }), 'photo.png');
        const request = new HttpRequest('POST', '/api/v1/attachments', formData);
        let interceptedRequest: HttpRequest<unknown> | undefined;

        TestBed.runInInjectionContext(() => {
            apiInterceptor(request, nextRequest => {
                interceptedRequest = nextRequest;
                return of(new HttpResponse());
            }).subscribe();
        });

        expect(interceptedRequest?.params.get('ngsw-bypass')).toBe('true');
        expect(interceptedRequest?.body).toBe(formData);
    });

    it('does not bypass the service worker for regular API requests', () => {
        const request = new HttpRequest('POST', '/api/v1/statuses', { note: 'A photo' });
        let interceptedRequest: HttpRequest<unknown> | undefined;

        TestBed.runInInjectionContext(() => {
            apiInterceptor(request, nextRequest => {
                interceptedRequest = nextRequest;
                return of(new HttpResponse());
            }).subscribe();
        });

        expect(interceptedRequest?.params.has('ngsw-bypass')).toBe(false);
    });
});
