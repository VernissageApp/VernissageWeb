import { Component, OnDestroy, AfterViewInit, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoadingService } from './services/common/loading.service';
import { RoutingStateService } from './services/common/routing-state.service';
import { DOCUMENT } from '@angular/common';
import { SsrCookieService } from './services/common/ssr-cookie.service';
import { SettingsService } from './services/http/settings.service';
import { fadeInAnimation } from './animations/fade-in.animation';
import { WebServiceWorker } from './services/common/web-service-worker.service';
import { MessagesService } from './services/common/messages.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    private isAnyNewUpdateAvailableSubscription?: Subscription;
    private isInUnrecoverableStateSubscription?: Subscription;
    private loadingStateChangesSubscription?: Subscription;

    private document = inject(DOCUMENT);
    private loadingService = inject(LoadingService);
    private cookieService = inject(SsrCookieService);
    private settingsService = inject(SettingsService);
    private routingStateService = inject(RoutingStateService);
    private webServiceWorker = inject(WebServiceWorker);
    private messagesService = inject(MessagesService);
    private matSnackBar = inject(MatSnackBar);

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

        const imagesUrl = this.settingsService.publicSettings?.imagesUrl ?? '';
        if (imagesUrl.length > 0) {
            this.createPreloadLink(imagesUrl);
        }

        this.initializeApplicationStateUpdates();
    }

    ngAfterViewInit(): void {
        this.loadingStateChangesSubscription = this.loadingService.loadingStateChanges.subscribe(isLoading => {
            this.showLoader.set(isLoading);
        });
    }

    ngOnDestroy(): void {
        this.loadingStateChangesSubscription?.unsubscribe();
        this.isAnyNewUpdateAvailableSubscription?.unsubscribe();
        this.isInUnrecoverableStateSubscription?.unsubscribe();
    }

    private initializeApplicationStateUpdates() {
        this.isAnyNewUpdateAvailableSubscription = this.webServiceWorker.$isAnyNewUpdateAvailable.subscribe((versionAvailableFlag) => {
            if (versionAvailableFlag) {
                const matSnackBarRef = this.matSnackBar.open('A new version of Vernissage is available. Please refresh the page to get the latest version.', 'Refresh', {
                    duration: 30000,
                    verticalPosition: 'top',
                    panelClass: ['message-success']
                });

                matSnackBarRef.onAction().subscribe(() => {
                    document.location.reload();
                });
            }
        });

        this.isInUnrecoverableStateSubscription = this.webServiceWorker.$isInUnrecoverableState.subscribe((unrecoverableStateFlag) => {
            if (unrecoverableStateFlag) {
                this.messagesService.showSuccess('An error occurred that we cannot recover application state. Please reload the page.');
            }
        });
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
