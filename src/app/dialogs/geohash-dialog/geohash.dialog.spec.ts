import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GeohashDialog } from './geohash.dialog';

describe('GeohashDialog', () => {
    const close = vi.fn();

    beforeEach(() => {
        close.mockReset();
        TestBed.configureTestingModule({
            providers: [{ provide: MatDialogRef, useValue: { close } }]
        });
    });

    it('updates coordinates while a valid geohash is entered', () => {
        const dialog = TestBed.runInInjectionContext(() => new GeohashDialog());

        dialog['onGeohashChange']('u4pruydqqvj');

        expect(Number(dialog['latitude']())).toBeCloseTo(57.64911063, 7);
        expect(Number(dialog['longitude']())).toBeCloseTo(10.40743969, 7);
    });

    it('keeps the dialog open when the submitted geohash is invalid', () => {
        const dialog = TestBed.runInInjectionContext(() => new GeohashDialog());
        dialog['geohash'].set('invalid');

        dialog['onSubmit']();

        expect(close).not.toHaveBeenCalled();
    });

    it('closes with decoded coordinates when the submitted geohash is valid', () => {
        const dialog = TestBed.runInInjectionContext(() => new GeohashDialog());
        dialog['geohash'].set('u4pruydqqvj');

        dialog['onSubmit']();

        expect(close).toHaveBeenCalledOnce();
        expect(Number(close.mock.calls[0][0].latitude)).toBeCloseTo(57.64911063, 7);
        expect(Number(close.mock.calls[0][0].longitude)).toBeCloseTo(10.40743969, 7);
    });
});
