import { Component, OnDestroy, AfterViewInit, ChangeDetectorRef, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadingService } from './services/common/loading.service';
import { RoutingStateService } from './services/common/routing-state.service';
import { DOCUMENT } from '@angular/common';
import { SsrCookieService } from './services/common/ssr-cookie.service';
import { SettingsService } from './services/http/settings.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    showLoader = false;
    loadingStateChangesSubscription?: Subscription;

    constructor(
        @Inject(DOCUMENT) private documentRef: Document,
        private loadingService: LoadingService,
        private cookieService: SsrCookieService,
        private settingsService: SettingsService,
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

        const internalMastodonUrl = this.settingsService.publicSettings?.mastodonUrl ?? '';
        if (internalMastodonUrl.length > 0) {
            this.createMastodonLink(internalMastodonUrl);
        }

        const s3Address = this.settingsService.publicSettings?.s3Address ?? '';
        if (s3Address.length > 0) {
            this.createPreloadLink(s3Address);
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

    // e.g. <link href="https://mastodon.social/@account" rel="me">
    private createMastodonLink(url: string): void {
        const link: HTMLLinkElement = this.documentRef.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'me');

        this.documentRef.head.appendChild(link);
    }

    // e.g. <link rel="preconnect" href="https://s3.eu-central-1.amazonaws.com">
    private createPreloadLink(url: string): void {
        const link: HTMLLinkElement = this.documentRef.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'preconnect');

        this.documentRef.head.appendChild(link);
    }
}
