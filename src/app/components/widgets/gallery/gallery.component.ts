import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Attachment } from 'src/app/models/attachment';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { NavigationStart, Router } from '@angular/router';
import { WindowService } from 'src/app/services/common/window.service';
import { isPlatformBrowser } from '@angular/common';
import { GalleryStatus } from 'src/app/models/gallery-status';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    animations: fadeInAnimation
})
export class GalleryComponent extends ResponsiveComponent implements OnInit, OnDestroy, OnChanges {
    readonly amountOfPriorityImages = 8;

    @Input() statuses?: LinkableResult<Status>;
    @Input() squareImages = false;
    @Input() hideAvatars = false;
    @Input() isDetached = false;

    gallery?: GalleryStatus[][];
    sizes?: number[];
    columns = 3;
    alwaysShowNSFW = false;
    isDuringLoadingMode = false;
    avatarVisible = true;
    isBrowser = false;
    isReady = false;

    galleryBreakpointSubscription?: Subscription;
    routeNavigationStartSubscription?: Subscription;

    private isReadyTimeout?: NodeJS.Timeout;
    private startUrl?: URL;
    private currentUrl?: URL;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private loadingService: LoadingService,
        private preferencesService: PreferencesService,
        private router: Router,
        private contextStatusesService: ContextStatusesService,
        private galleryBreakpointObserver: BreakpointObserver,
        private windowService: WindowService
    ) {
        super(galleryBreakpointObserver);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    override ngOnInit(): void {
        this.startUrl = new URL(this.router.routerState.snapshot.url, this.windowService.getApplicationUrl());
        this.alwaysShowNSFW = this.preferencesService.alwaysShowNSFW;

        this.galleryBreakpointSubscription = this.galleryBreakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
            if (result.matches) {
                this.columns = this.squareImages ? 3 : 1;
                this.avatarVisible = !this.squareImages;
                this.buildGallery();
            } else {
                this.columns = 3;
                this.avatarVisible = true;
                this.buildGallery();
            }
        });

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;
                this.currentUrl = new URL(navigationStarEvent.url, this.windowService.getApplicationUrl());
            });

        this.isReadyTimeout = setTimeout(() => {
            this.isReady = true;
        }, 500);
    }    

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.statuses) {
            this.contextStatusesService.setContextStatuses(this.statuses);
            this.buildGallery();
        }
    }

    override ngOnDestroy(): void {
        if (this.isReadyTimeout) {
            clearTimeout(this.isReadyTimeout);
        }
    }

    async onNearEndScroll(): Promise<void> {
        if (!this.isReady) {
            return;
        }

        if (!this.isDuringLoadingMode) {
            this.isDuringLoadingMode = true;

            if (this.currentUrl && this.startUrl?.pathname !== this.currentUrl.pathname) {
                this.isDuringLoadingMode = false;
                return;
            }

            if (this.contextStatusesService.allOlderStatusesDownloaded) {
                this.isDuringLoadingMode = false;
                return;
            }

            if (!this.statuses?.data.length) {
                this.isDuringLoadingMode = false;
                return;
            }

            this.loadingService.showLoader();

            const amountOfStatusesBeforeLoadMode = this.statuses.data.length;
            await this.contextStatusesService.loadOlder();
            this.appendToGallery(amountOfStatusesBeforeLoadMode);

            this.loadingService.hideLoader();
            this.isDuringLoadingMode = false;
        }
    }

    private buildGallery(): void {
        this.gallery = [];
        this.sizes = [];

        for(let i = 0; i < this.columns; i++) {
            this.gallery?.push([]);
            this.sizes.push(0);
        }

        if (!this.statuses) {
            return;
        }

        for (const [index, status] of this.statuses.data.entries()) {
            const imageHeight = this.getImageConstraitHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(imageHeight);

            this.sizes[smallerColumnIndex] = this.sizes[smallerColumnIndex] + imageHeight;
            this.gallery[smallerColumnIndex].push(new GalleryStatus(status, index < this.amountOfPriorityImages));
        }
    }

    private appendToGallery(fromIndex: number): void {
        if (!this.sizes) {
            return;
        }

        if (!this.gallery) {
            return;
        }

        if (!this.statuses?.data) {
            return;
        }

        for(let i = fromIndex; i < this.statuses.data.length; i++) {
            const status = this.statuses.data[i];

            const imageHeight = this.getImageConstraitHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(imageHeight);

            this.sizes[smallerColumnIndex] = this.sizes[smallerColumnIndex] + imageHeight;
            this.gallery[smallerColumnIndex].push(new GalleryStatus(status, false));
        }
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    private getSmallerColumnIndex(currentImageHeight: number): number {
        if (!this.sizes) {
            return 0;
        }

        let index = 0;
        let minSize = 999999999;
        for(let i = 0; i < this.sizes.length; i++) {
            if ((this.sizes[i] + currentImageHeight) < minSize) {
                minSize = this.sizes[i] + currentImageHeight;
                index = i;
            }
        }

        return index;
    }

    private getMainAttachment(status: Status): Attachment | null {
        const mainStatus = status.reblog ?? status;

        if (!mainStatus.attachments) {
            return null;
        }
    
        if (mainStatus.attachments?.length === 0) {
            return null;
        }
    
        return mainStatus.attachments[0]
    }

    private getImageConstraitHeight(status: Status): number {
        if (this.squareImages) {
            return 1;
        }

        const mainAttachment = this.getMainAttachment(status);

        const height = mainAttachment?.originalFile?.height ?? 0.0;
        const width = mainAttachment?.originalFile?.width ?? 0.0;

        return height / width;
    }
}
