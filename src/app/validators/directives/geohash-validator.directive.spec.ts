import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { GeohashValidatorDirective } from './geohash-validator.directive';

describe('GeohashValidatorDirective', () => {
    it('accepts valid geohashes and rejects invalid values', () => {
        const validator = TestBed.runInInjectionContext(() => new GeohashValidatorDirective());

        expect(validator.validate(new FormControl('u4pruydqqvj'))).toBeNull();
        expect(validator.validate(new FormControl('invalid'))).toEqual({
            appGeohashValid: { valid: false }
        });
        expect(validator.validate(new FormControl(''))).toEqual({
            appGeohashValid: { valid: false }
        });
    });
});
