import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SettingsService } from '../http/settings.service';

@Injectable({
    providedIn: 'root'
})
export class CustomScriptsService {
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

        this.injectCustomFileScript();
        this.injectCustomInlineScript();
    }

    private injectCustomFileScript(): void {
        const customScriptFile = this.settingsService.publicSettings?.customFileScript?.trim();

        if (customScriptFile && customScriptFile.length > 0) {
            const scriptTag = this.document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = customScriptFile;
            this.document.body.appendChild(scriptTag);
        }
    }

    private injectCustomInlineScript(): void {
        const customScriptContent = this.settingsService.publicSettings?.customInlineScript?.trim();

        if (customScriptContent && customScriptContent.length > 0) {
            const scriptElement = this.document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.appendChild(document.createTextNode(customScriptContent));
            this.document.getElementsByTagName('head')[0].appendChild(scriptElement);
        }
    }
}
