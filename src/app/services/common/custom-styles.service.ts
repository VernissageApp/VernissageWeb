import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SettingsService } from '../http/settings.service';

@Injectable({
    providedIn: 'root'
})
export class CustomStylesService {
    private isBrowser = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) private platformId: object,
        private settingsService: SettingsService
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    public inject(): void {
        if (!this.isBrowser) {
            return;
        }

        this.injectCustomFileStyle();
        this.injectCustomInlineStyle();
    }

    private injectCustomFileStyle(): void {
        const customFileStyle = this.settingsService.publicSettings?.customFileStyle?.trim();

        if (customFileStyle && customFileStyle.length > 0) {
            const linkElement = this.document.createElement('link');
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('href', customFileStyle);
            this.document.getElementsByTagName('head')[0].appendChild(linkElement);
        }
    }

    private injectCustomInlineStyle(): void {
        const customInlineStyle = this.settingsService.publicSettings?.customInlineStyle?.trim();

        if (customInlineStyle && customInlineStyle.length > 0) {
            const styleElement = this.document.createElement('style');
            styleElement.appendChild(document.createTextNode(customInlineStyle));
            this.document.getElementsByTagName('head')[0].appendChild(styleElement);
        }
    }
}
