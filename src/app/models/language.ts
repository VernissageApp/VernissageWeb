export interface Language {
    locale: string;
    labelKey: string;
}

export interface HeaderLanguage {
    language: string;
    labelKey: string;
}

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
    // { locale: 'it_IT', labelKey: 'pages.register.language.italian' }
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
