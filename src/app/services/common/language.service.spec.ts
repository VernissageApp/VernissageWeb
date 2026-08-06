import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferencesService } from './preferences.service';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideNativeDateAdapter(),
                { provide: PLATFORM_ID, useValue: 'browser' },
                { provide: PreferencesService, useValue: { language: null } },
                {
                    provide: TranslateService,
                    useValue: {
                        addLangs: vi.fn(),
                        setFallbackLang: vi.fn(() => of('en-us')),
                        use: vi.fn((language: string) => of(language)),
                        getCurrentLang: vi.fn(() => undefined)
                    }
                }
            ]
        });
    });

    it('uses the application language locale for Material date inputs', async () => {
        const service = TestBed.inject(LanguageService);
        const dateAdapter = TestBed.inject(DateAdapter<Date>);
        const setLocaleSpy = vi.spyOn(dateAdapter, 'setLocale');

        await service.setLanguageFromLocale('en_GB');

        const formattedDate = dateAdapter.format(
            new Date(Date.UTC(2026, 7, 6, 12)),
            { year: 'numeric', month: 'numeric', day: 'numeric' }
        );

        expect(setLocaleSpy).toHaveBeenCalledWith('en-GB');
        expect(formattedDate).toBe('06/08/2026');
    });
});
