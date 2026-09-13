import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';

import { GlobalErrorHandler } from './global-error-handler';
import { RESPONSE } from 'express.tokens';

describe('GlobalErrorHandler', () => {
    it('sets HTTP 404 and does not log expected not-found responses during SSR', async () => {
        const status = vi.fn();
        const navigate = vi.fn(async () => {
            expect(status).toHaveBeenCalledWith(404);
            return true;
        });
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const handler = new GlobalErrorHandler(
            'server' as unknown as object,
            { get: vi.fn((token: unknown) => token === RESPONSE ? { status } : { navigate }) } as never,
            { run: vi.fn(async (callback) => await callback()) } as never,
            {} as never,
            { set: vi.fn() } as never,
            { hideLoader: vi.fn() } as never,
            {} as never,
            {} as never,
            { getStringFromError: vi.fn(() => 'not found') } as never
        );
        const error = new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            url: 'https://vernissage.photos/api/v1/statuses/missing'
        });

        await handler.handleError(error);

        expect(consoleError).not.toHaveBeenCalled();
        expect(status).toHaveBeenCalledWith(404);
        expect(navigate).toHaveBeenCalledWith(['/page-not-found']);
        consoleError.mockRestore();
    });

    it('does not log expected HTTP 401 responses during SSR', async () => {
        const navigate = vi.fn(async () => true);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const handler = new GlobalErrorHandler(
            'server' as unknown as object,
            { get: vi.fn(() => ({ navigate })) } as never,
            { run: vi.fn(async (callback) => await callback()) } as never,
            {} as never,
            { set: vi.fn() } as never,
            { hideLoader: vi.fn() } as never,
            {} as never,
            {} as never,
            { getStringFromError: vi.fn(() => 'unauthorized') } as never
        );
        const error = new HttpErrorResponse({
            status: 401,
            statusText: 'Unauthorized',
            url: 'https://vernissage.photos/api/v1/notifications'
        });

        await handler.handleError(error);

        expect(consoleError).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(['/login']);
        consoleError.mockRestore();
    });
});
