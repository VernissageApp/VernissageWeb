import { Injectable } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { getWindow } from 'ssr-window';

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    constructor(private location: Location, private platformLocation: PlatformLocation) {
    }

    get nativeWindow(): Window {
        return getWindow();
    }

    private getLocationHostname(): string {
        return this.platformLocation.hostname;
    }

    private getLocationProtocol(): string {
        return this.platformLocation.protocol;
    }

    private getLocationPort(): string {
        return this.platformLocation.port;
    }

    private getApplicationFolder(): string {
        return this.location.prepareExternalUrl('');
    }

    getApplicationUrl(): string {
        return 'http://localhost:4200';

        // const host = this.getLocationHostname();
        // if (host.startsWith('localhost')) {
        //     return this.getLocationProtocol() +  '//localhost:4200';
        // }
    
        // const applicationFolder = this.getApplicationFolder();
        // return this.getLocationProtocol() +  '//' + host + applicationFolder;
    }

    apiService(): string {
        return 'localhost:8080';

        // const host = this.getLocationHostname();
        // if (host.startsWith('localhost')) {
        //     return 'localhost:8080';
        // }
    
        // return host;
    }

    apiUrl(): string {
        // return this.getLocationProtocol() +  '//' + this.apiService();
        return 'http://localhost:8080';
    }

    openPage(url: string): void {
        this.nativeWindow.open(url, "_blank");
    }
}
