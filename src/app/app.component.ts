import { Component, OnDestroy, AfterViewInit, OnInit, Inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadingService } from './services/common/loading.service';
import { RoutingStateService } from './services/common/routing-state.service';
import { DOCUMENT } from '@angular/common';
import { SsrCookieService } from './services/common/ssr-cookie.service';
import { SettingsService } from './services/http/settings.service';
import { fadeInAnimation } from './animations/fade-in.animation';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [fadeInAnimation],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    protected showLoader = signal(false);
    private loadingStateChangesSubscription?: Subscription;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private loadingService: LoadingService,
        private cookieService: SsrCookieService,
        private settingsService: SettingsService,
        private routingStateService: RoutingStateService) {
    }

    ngOnInit(): void {
        this.routingStateService.startRoutingListener();

        const isLightTheme = (this.cookieService.get('isLightTheme') ?? 'true') === 'true';
        if (!isLightTheme) {
            const body = this.document.getElementById('body');
            body?.classList.add('dark-theme');
            this.document.querySelector("meta[name='theme-color']")?.setAttribute("content", "#303030");
            this.document.querySelector('html')?.setAttribute("class", "mat-dark");
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
            this.showLoader.set(isLoading);
        });
    }

    ngOnDestroy(): void {
        this.loadingStateChangesSubscription?.unsubscribe();
    }

    // e.g. <link href="https://mastodon.social/@account" rel="me">
    private createMastodonLink(url: string): void {
        const link: HTMLLinkElement = this.document.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'me');

        this.document.head.appendChild(link);
    }

    // e.g. <link rel="preconnect" href="https://s3.eu-central-1.amazonaws.com">
    private createPreloadLink(url: string): void {
        const link: HTMLLinkElement = this.document.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'preconnect');

        this.document.head.appendChild(link);
    }
}
