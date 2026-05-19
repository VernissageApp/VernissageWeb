import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { REQUEST } from 'express.tokens';
import { PreferencesService } from './preferences.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly defaultLanguage = 'en';
    private readonly supportedLanguages = ['de', 'en', 'es', 'fi', 'fr', 'it', 'no', 'pl', 'sv'];
    private readonly languageLocales: Record<string, string> = {
        de: 'de-DE',
        en: 'en-US',
        es: 'es-ES',
        fi: 'fi-FI',
        fr: 'fr-FR',
        it: 'it-IT',
        no: 'no-NO',
        pl: 'pl-PL',
        sv: 'sv-SE'
    };

    private platformId = inject(PLATFORM_ID);
    private request: Request | null = inject(REQUEST, { optional: true });
    private preferencesService = inject(PreferencesService);
    private translateService = inject(TranslateService);

    async initializeLanguage(): Promise<void> {
        const languageFromPreferences = this.normalizeLanguage(this.preferencesService.language);
        const languageFromEnvironment = isPlatformBrowser(this.platformId) ? this.getLanguageFromNavigator() : this.getLanguageFromRequestHeader();
        const language = languageFromPreferences ?? languageFromEnvironment ?? this.defaultLanguage;

        await this.setLanguage(language, false);
    }

    async setLanguageFromLocale(locale: string | null | undefined, persist = true): Promise<void> {
        const languageFromLocale = this.normalizeLanguage(locale);
        if (!languageFromLocale) {
            return;
        }

        await this.setLanguage(languageFromLocale, persist);
    }

    getCurrentLanguage(): string {
        const currentLanguage = this.normalizeLanguage(this.translateService.getCurrentLang());
        if (currentLanguage) {
            return currentLanguage;
        }

        return this.defaultLanguage;
    }

    getCurrentLanguageLocale(): string {
        return this.mapLanguageToLocale(this.getCurrentLanguage());
    }

    getAcceptLanguage(): string {
        return this.getCurrentLanguageLocale();
    }

    private async setLanguage(language: string, persist: boolean): Promise<void> {
        const normalizedLanguage = this.normalizeLanguage(language) ?? this.defaultLanguage;

        this.translateService.addLangs(this.supportedLanguages);
        await firstValueFrom(this.translateService.setFallbackLang(this.defaultLanguage));
        await firstValueFrom(this.translateService.use(normalizedLanguage));

        if (persist) {
            this.preferencesService.language = normalizedLanguage;
        }
    }

    private getLanguageFromRequestHeader(): string | null {
        const acceptLanguageHeader = this.request?.headers['accept-language'];
        if (!acceptLanguageHeader) {
            return null;
        }

        const rawHeaderValue = Array.isArray(acceptLanguageHeader) ? acceptLanguageHeader[0] : acceptLanguageHeader;
        const headerParts = rawHeaderValue.split(',');
        if (headerParts.length === 0) {
            return null;
        }

        return this.normalizeLanguage(headerParts[0] ?? null);
    }

    private getLanguageFromNavigator(): string | null {
        return this.normalizeLanguage(globalThis.navigator?.language ?? null);
    }

    private normalizeLanguage(language: string | null | undefined): string | null {
        if (!language) {
            return null;
        }

        const normalizedLanguage = language.toLowerCase().replace('_', '-');
        if (normalizedLanguage === 'nb' || normalizedLanguage === 'nn' || normalizedLanguage.startsWith('nb-') || normalizedLanguage.startsWith('nn-')) {
            return 'no';
        }

        return this.supportedLanguages.find(supportedLanguage => normalizedLanguage === supportedLanguage || normalizedLanguage.startsWith(`${supportedLanguage}-`)) ?? null;
    }

    private mapLanguageToLocale(language: string): string {
        return this.languageLocales[language] ?? this.languageLocales[this.defaultLanguage];
    }
}
