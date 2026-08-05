import { PartialMatchRouteSnapshot, Route, UrlSegment } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { numericStatusIdCanMatch } from './numeric-status-id-can-match';

describe('numericStatusIdCanMatch', () => {
    const route: Route = { path: ':userName/:id' };
    const currentSnapshot = {} as PartialMatchRouteSnapshot;

    it('matches numeric status identifiers without converting them to numbers', () => {
        const segments = [
            new UrlSegment('@user', {}),
            new UrlSegment('7597941921381623997', {})
        ];

        expect(numericStatusIdCanMatch(route, segments, currentSnapshot)).toBe(true);
    });

    it('rejects asset names used as status identifiers', () => {
        expect(numericStatusIdCanMatch(route, [
            new UrlSegment('statuses', {}),
            new UrlSegment('manifest.webmanifest', {})
        ], currentSnapshot)).toBe(false);
        expect(numericStatusIdCanMatch(route, [
            new UrlSegment('statuses', {}),
            new UrlSegment('favicon.ico', {})
        ], currentSnapshot)).toBe(false);
    });

    it('rejects partially numeric identifiers', () => {
        expect(numericStatusIdCanMatch(route, [
            new UrlSegment('@user', {}),
            new UrlSegment('123abc', {})
        ], currentSnapshot)).toBe(false);
    });
});
