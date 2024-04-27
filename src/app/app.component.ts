import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadingService } from './services/common/loading.service';
import { RoutingStateService } from './services/common/routing-state.service';
import { DOCUMENT } from '@angular/common';
import { CookieService } from 'ngx-cookie';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    showLoader = false;
    loadingStateChangesSubscription?: Subscription;

    constructor(
        @Inject(DOCUMENT) private documentRef: Document,
        private loadingService: LoadingService,
        private cookieService: CookieService,
        private routingStateService: RoutingStateService,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.routingStateService.startRoutingListener();

        const isLightTheme = (this.cookieService.get('isLightTheme') ?? 'true') === 'true';
        if (!isLightTheme) {
            const body = this.documentRef.getElementById('body');
            body?.classList.add('dark-theme');
            this.documentRef.querySelector("meta[name='theme-color']")?.setAttribute("content", "#303030");
        }
    }

    ngAfterViewInit(): void {
        this.loadingStateChangesSubscription = this.loadingService.loadingStateChanges.subscribe(isLoading => {
            this.showLoader = isLoading;
            this.changeDetectorRef.detectChanges();
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.loadingStateChangesSubscription?.unsubscribe();
    }
}
