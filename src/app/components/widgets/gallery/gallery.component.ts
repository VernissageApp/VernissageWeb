import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Attachment } from 'src/app/models/attachment';
import { LoadingService } from 'src/app/services/common/loading.service';
import { Responsive } from 'src/app/common/responsive';
import { NavigationStart, Router } from '@angular/router';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    animations: fadeInAnimation
})
export class GalleryComponent extends Responsive implements OnInit, OnChanges {
    @Input() statuses?: LinkableResult<Status>;

    gallery?: Status[][];
    sizes?: number[];
    columns = 3;
    isDuringLoadingMode = false;
    allStatusesLoaded = false;

    galleryBreakpointSubscription?: Subscription;
    routeNavigationStartSubscription?: Subscription;

    private startUrl?: URL;
    private currentUrl?: URL;

    constructor(
        private loadingService: LoadingService,
        private router: Router,
        private contextStatusesService: ContextStatusesService,
        private galleryBreakpointObserver: BreakpointObserver,
        private windowService: WindowService
    ) {
        super(galleryBreakpointObserver);
    }

    override ngOnInit(): void {
        this.startUrl = new URL(this.router.routerState.snapshot.url, this.windowService.getApplicationUrl());

        this.galleryBreakpointSubscription = this.galleryBreakpointObserver.observe([
            Breakpoints.XSmall, Breakpoints.Small
        ]).subscribe(result => {
            if (result.matches) {
                this.isHandset = true;
                this.columns = 1;
                this.buildGallery();
            } else {
                this.isHandset = false;
                this.columns = 3;
                this.buildGallery();
            }
        });

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;
                this.currentUrl = new URL(navigationStarEvent.url, this.windowService.getApplicationUrl());
            });
    }    

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.statuses) {
            this.contextStatusesService.setContextStatuses(this.statuses);

            this.allStatusesLoaded = false;
            this.buildGallery();
        }
    }

    async onNearEndScroll(): Promise<void> {        
        if (this.currentUrl && this.startUrl?.pathname !== this.currentUrl.pathname) {
            return;
        }

        if (this.allStatusesLoaded) {
            return;
        }

        if (!this.statuses?.data.length) {
            return;
        }

        if (!this.isDuringLoadingMode) {
            this.isDuringLoadingMode = true;
            this.loadingService.showLoader();

            const amountOfStatusesBeforeLoadMode = this.statuses.data.length;
            await this.contextStatusesService.getNext(this.statuses.data[amountOfStatusesBeforeLoadMode - 1].id);
            const amountOfStatusesAfterLoadMode = this.statuses.data.length;

            if (amountOfStatusesBeforeLoadMode === amountOfStatusesAfterLoadMode) {
                this.allStatusesLoaded = true;
            } else {
                this.appendToGallery(amountOfStatusesBeforeLoadMode);
            }
            
            this.loadingService.hideLoader();
            this.isDuringLoadingMode = false;
        }
    }

    trackByFn(_: number, item: Status): string | undefined{
        return item.id;
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

        for (let status of this.statuses.data) {
            const imageHeight = this.getImageConstraitHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(imageHeight);

            this.sizes[smallerColumnIndex] = this.sizes[smallerColumnIndex] + imageHeight;
            this.gallery[smallerColumnIndex].push(status);
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
            let status = this.statuses.data[i];

            const imageHeight = this.getImageConstraitHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(imageHeight);

            this.sizes[smallerColumnIndex] = this.sizes[smallerColumnIndex] + imageHeight;
            this.gallery[smallerColumnIndex].push(status);
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
        const mainAttachment = this.getMainAttachment(status);

        const height = mainAttachment?.originalFile?.height ?? 0.0;
        const width = mainAttachment?.originalFile?.width ?? 0.0;

        return height / width;
    }
}
