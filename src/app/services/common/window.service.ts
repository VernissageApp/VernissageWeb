import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { Location, isPlatformServer } from '@angular/common';
import { getWindow } from 'ssr-window';
import { Request } from "express";
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Optional() @Inject(REQUEST) protected request: Request | null,
        private location: Location) {
    }

    get nativeWindow(): Window {
        return getWindow();
    }

    private getLocationHostname(): string {
        if (isPlatformServer(this.platformId)) {
            // In the SSR we have to use headers.
            const forwardedHostHeader = this.request?.headers['x-forwarded-host'] as string;
            if (forwardedHostHeader && forwardedHostHeader.length > 0) {
                return forwardedHostHeader;
            }

            const hostHeader = this.request?.headers['host'];
            if (hostHeader && hostHeader.length > 0) {
                return hostHeader;
            }

            console.error('Request have to contain "x-forwarded-host" or "host" header with URL to API. Current headers:');
            console.error(this.request?.headers);

            return window.location.hostname;
        } else {
            // In the browser mode we have to use URL (hostname: eg. 'localhost' or 'vernissage.photos').
            return window.location.hostname;
        }
    }

    private getApplicationFolder(): string {
        return this.location.prepareExternalUrl('');
    }

    getApplicationUrl(): string {
        const applicationFolder = this.getApplicationFolder();
        const host = this.getLocationHostname();

        if (host.startsWith('localhost')) {
            return 'http://localhost:4200' + applicationFolder;;
        }
            
        return 'https://' + host + applicationFolder;
    }

    apiService(): string {
        const host = this.getLocationHostname();
        if (host.startsWith('localhost')) {
            return 'localhost:8080';
        }
    
        return host;
    }

    apiUrl(): string {
        const host = this.getLocationHostname();
        if (host.startsWith('localhost')) {
            return 'http://localhost:8080';
        }

        return 'https://' + this.apiService();
    }

    openPage(url: string): void {
        this.nativeWindow.open(url, "_blank");
    }
}
