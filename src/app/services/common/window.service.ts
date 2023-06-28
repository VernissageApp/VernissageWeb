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
}
