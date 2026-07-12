import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { REQUEST } from 'express.tokens';
import type { HeaderLanguage, Language } from 'src/app/models/language';
import { PreferencesService } from './preferences.service';

export const SUPPORTED_LANGUAGES: readonly Language[] = [
    { locale: 'en_US', labelKey: 'pages.register.language.english' },
    { locale: 'en_GB', labelKey: 'pages.register.language.englishGb' },
    { locale: 'fi_FI', labelKey: 'pages.register.language.finnish' },
    { locale: 'fr_FR', labelKey: 'pages.register.language.french' },
    { locale: 'es_ES', labelKey: 'pages.register.language.spanish' },
    { locale: 'de_DE', labelKey: 'pages.register.language.german' },
    // { locale: 'nb_NO', labelKey: 'pages.register.language.norwegian' },
    { locale: 'pl_PL', labelKey: 'pages.register.language.polish' },
    // { locale: 'pt_PT', labelKey: 'pages.register.language.portuguese' },
    // { locale: 'sv_SE', labelKey: 'pages.register.language.swedish' },
    { locale: 'it_IT', labelKey: 'pages.register.language.italian' }
];

export function getLanguageFlag(locale: string): string {
    return normalizeLanguageLocale(locale).split('-')[1] ?? locale;
}

export function normalizeLanguageLocale(locale: string | null | undefined): string {
    return locale?.toLowerCase().replace('_', '-') ?? '';
}

export function mapLocaleToLanguage(locale: string): string {
    return normalizeLanguageLocale(locale);
}

export const SUPPORTED_HEADER_LANGUAGES: readonly HeaderLanguage[] = SUPPORTED_LANGUAGES.map(language => ({
    language: mapLocaleToLanguage(language.locale),
    labelKey: language.labelKey
}));

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly defaultLanguage = 'en-us';
    private readonly supportedLanguages = SUPPORTED_HEADER_LANGUAGES.map(language => language.language);
    private readonly languageLocales = SUPPORTED_LANGUAGES.reduce<Record<string, string>>((locales, language) => {
        locales[mapLocaleToLanguage(language.locale)] = language.locale.replace('_', '-');
        return locales;
    }, {});

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
        const exactLanguage = this.supportedLanguages.find(supportedLanguage => normalizedLanguage === supportedLanguage || normalizedLanguage.startsWith(`${supportedLanguage}-`));
        if (exactLanguage) {
            return exactLanguage;
        }

        return this.supportedLanguages.find(supportedLanguage => {
            const languageCode = supportedLanguage.split('-')[0];
            return normalizedLanguage === languageCode || normalizedLanguage.startsWith(`${languageCode}-`);
        }) ?? null;
    }

    private mapLanguageToLocale(language: string): string {
        return this.languageLocales[language] ?? this.languageLocales[this.defaultLanguage];
    }
}
