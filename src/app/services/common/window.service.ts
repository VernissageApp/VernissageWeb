import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function getWindow(): Window {
    return window;
}

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    constructor(
        private location: Location
    ) { }

    get nativeWindow(): Window {
        return getWindow();
    }

    getLocationOrigin(): string {
        return this.nativeWindow.location.origin;
    }

    getApplicationFolder(): string {
        return this.location.prepareExternalUrl('');
    }

    getApplicationUrl(): string {
        const url = this.getLocationOrigin();
        const applicationFolder = this.getApplicationFolder();

        return url + applicationFolder;
    }

    apiService(): string {
        const host = getWindow().document.location.host;
        if (host.startsWith('localhost:')) {
            return 'localhost:8080';
        }
    
        return host;
    }

    apiProtocol(): string {
        return getWindow().document.location.protocol;
    }

    apiUrl(): string {
        return this.apiProtocol() + '//' + this.apiService();
    }

    openPage(url: string): void {
        this.nativeWindow.open(url, "_blank");
    }
}
