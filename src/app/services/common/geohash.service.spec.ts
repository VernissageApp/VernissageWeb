import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { GeohashService } from './geohash.service';

describe('GeohashService', () => {
    const service = TestBed.inject(GeohashService);

    it('validates standard geohash values', () => {
        expect(service.isValid('u4pruydqqvj')).toBe(true);
        expect(service.isValid(' U4PRUYDQQVJ ')).toBe(true);
        expect(service.isValid('')).toBe(false);
        expect(service.isValid('u4pruydqqvja1')).toBe(false);
        expect(service.isValid('u4pruydqqvi')).toBe(false);
    });

    it('decodes a geohash to the centre of its bounding box', () => {
        const coordinates = service.decode('u4pruydqqvj');

        expect(coordinates?.latitude).toBeCloseTo(57.64911063, 7);
        expect(coordinates?.longitude).toBeCloseTo(10.40743969, 7);
    });

    it('does not decode invalid values', () => {
        expect(service.decode('not-a-geohash')).toBeUndefined();
    });
});
