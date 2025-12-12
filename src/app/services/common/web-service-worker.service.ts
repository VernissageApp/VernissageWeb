import { ApplicationRef, inject, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subscription, concat, first, interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebServiceWorker implements OnDestroy {
    public $isAnyNewUpdateAvailable = new BehaviorSubject(false);
    public $isInUnrecoverableState = new BehaviorSubject(false);
    
    private intervalSubscription?: Subscription;
    private versionUpdateSubscription?: Subscription;
    private unrecoverableSubscription?: Subscription;

    private applicationRef = inject(ApplicationRef);
    private swUpdate = inject(SwUpdate);

    constructor() {
        this.initialize();
    }

    ngOnDestroy(): void {
        this.intervalSubscription?.unsubscribe();
        this.versionUpdateSubscription?.unsubscribe();
        this.unrecoverableSubscription?.unsubscribe();
    }

    private initialize() {
        if (this.swUpdate.isEnabled) {
            // Allow the app to stabilize first, before starting polling for updates with `interval()`.
            const appIsStable$ = this.applicationRef.isStable.pipe(first((isStable) => isStable === true));
            const everyTwoHours$ = interval(2 * 60 * 60 * 1000);
            const everyTwoHoursOnceAppIsStable$ = concat(appIsStable$, everyTwoHours$);

            this.intervalSubscription = everyTwoHoursOnceAppIsStable$.subscribe(async () => {
                try {
                    await this.swUpdate.checkForUpdate();
                } catch (err) {
                  console.error('Failed to check for updates:', err);
                }
            });

            this.versionUpdateSubscription = this.swUpdate.versionUpdates
                .subscribe(evt => {
                    if (evt.type === 'VERSION_READY') {
                        this.$isAnyNewUpdateAvailable.next(true);
                    }
                });

            this.unrecoverableSubscription = this.swUpdate.unrecoverable
                .subscribe(() => {
                    this.$isInUnrecoverableState.next(true);
                });
        }
    }
}