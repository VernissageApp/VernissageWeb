import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { getLanguageFlag, Language, SUPPORTED_LANGUAGES } from 'src/app/models/language';

interface LanguageSelectOption {
    locale: string | null;
    labelKey: string;
}

const allLanguageOption: LanguageSelectOption = {
    locale: null,
    labelKey: 'components.languageSelect.all'
};

@Component({
    selector: 'app-language-select',
    templateUrl: './language-select.component.html',
    styleUrls: ['./language-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LanguageSelectComponent {
    public value = model<string | null>('en_US');
    public includeAll = input(false);

    protected readonly getLanguageFlag = getLanguageFlag;
    protected readonly languageOptions = computed<LanguageSelectOption[]>(() => {
        const supportedLanguages: Language[] = [...SUPPORTED_LANGUAGES];
        return this.includeAll() ? [allLanguageOption, ...supportedLanguages] : supportedLanguages;
    });

    protected readonly selectedLanguage = computed<LanguageSelectOption>(() => {
        return this.languageOptions().find(language => language.locale === this.value()) ?? this.languageOptions()[0] ?? allLanguageOption;
    });
}
