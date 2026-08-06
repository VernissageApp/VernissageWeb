import { TestBed } from '@angular/core/testing';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { SUPPORTED_LANGUAGES } from '../services/common/language.service';
import { LocalizedNativeDateAdapter } from './localized-native-date-adapter';

describe('LocalizedNativeDateAdapter', () => {
    let dateAdapter: DateAdapter<Date>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideNativeDateAdapter(),
                { provide: DateAdapter, useClass: LocalizedNativeDateAdapter }
            ]
        });

        dateAdapter = TestBed.inject(DateAdapter<Date>);
    });

    it.each(SUPPORTED_LANGUAGES)('parses the displayed date for $locale', ({ locale }) => {
        dateAdapter.setLocale(locale.replace('_', '-'));
        const originalDate = dateAdapter.createDate(2026, 7, 1);
        const displayedDate = dateAdapter.format(
            originalDate,
            { year: 'numeric', month: 'numeric', day: 'numeric' }
        );

        const date = dateAdapter.parse(displayedDate, null);

        expect(date).not.toBeNull();
        expect(dateAdapter.isValid(date!)).toBe(true);
        expect(dateAdapter.getYear(date!)).toBe(2026);
        expect(dateAdapter.getMonth(date!)).toBe(7);
        expect(dateAdapter.getDate(date!)).toBe(1);
    });

    it('rejects an invalid localized date', () => {
        dateAdapter.setLocale('pl-PL');

        const date = dateAdapter.parse('31.02.2026', null);

        expect(date).not.toBeNull();
        expect(dateAdapter.isValid(date!)).toBe(false);
    });
});
