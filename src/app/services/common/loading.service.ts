import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    static singletonInstance: LoadingService;

    loadingStateChanges: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor() {
        if (!LoadingService.singletonInstance) {
            LoadingService.singletonInstance = this;
        }

        return LoadingService.singletonInstance;
    }

    showLoader(): void {
        this.loadingStateChanges.next(true);
    }

    hideLoader(): void {
        this.loadingStateChanges.next(false);
    }
}
