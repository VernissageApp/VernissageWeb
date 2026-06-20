import { formatDate, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEs from '@angular/common/locales/es';
import localeFi from '@angular/common/locales/fi';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeNb from '@angular/common/locales/nb';
import localePl from '@angular/common/locales/pl';
import localePt from '@angular/common/locales/pt';
import localeSv from '@angular/common/locales/sv';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/common/language.service';

registerLocaleData(localeDe, 'de-DE');
registerLocaleData(localeEnGb, 'en-GB');
registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeEs, 'es-ES');
registerLocaleData(localeFi, 'fi-FI');
registerLocaleData(localeFr, 'fr-FR');
registerLocaleData(localeIt, 'it-IT');
registerLocaleData(localeNb, 'nb-NO');
registerLocaleData(localePl, 'pl-PL');
registerLocaleData(localePt, 'pt-PT');
registerLocaleData(localeSv, 'sv-SE');

@Pipe({
    name: 'localizedDate',
    pure: false,
    standalone: false
})
export class LocalizedDatePipe implements PipeTransform {
    private languageService = inject(LanguageService);

    transform(value: Date | string | number | null | undefined, format = 'mediumDate', timezone?: string, locale?: string): string | null {
        if (value == null || value === '') {
            return null;
        }

        return formatDate(value, format, locale ?? this.languageService.getCurrentLanguageLocale(), timezone);
    }
}
