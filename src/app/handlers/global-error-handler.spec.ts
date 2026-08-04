import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';

import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
    it('does not log expected HTTP 404 responses during SSR', async () => {
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
            { getStringFromError: vi.fn(() => 'not found') } as never
        );
        const error = new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            url: 'https://vernissage.photos/api/v1/statuses/missing'
        });

        await handler.handleError(error);

        expect(consoleError).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(['/page-not-found']);
        consoleError.mockRestore();
    });
});
