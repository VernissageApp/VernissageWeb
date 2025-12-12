import { Injectable, PLATFORM_ID, inject, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SettingsService } from '../http/settings.service';

@Injectable({
    providedIn: 'root'
})
export class CustomStylesService {
    private isBrowser = false;

    private document = inject(DOCUMENT);
    private platformId = inject(PLATFORM_ID);
    private settingsService = inject(SettingsService);

    constructor() {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    public injectStyles(): void {
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
