import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LazyLoaderService {
    static singletonInstance: LazyLoaderService;
    loaderId = signal('');

    constructor() {
        if (!LazyLoaderService.singletonInstance) {
            LazyLoaderService.singletonInstance = this;
        }

        return LazyLoaderService.singletonInstance;
    }
}
