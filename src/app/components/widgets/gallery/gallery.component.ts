import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Attachment } from 'src/app/models/attachment';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { GalleryStatus } from 'src/app/models/gallery-status';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { GalleryColumn } from 'src/app/models/gallery-column';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GalleryComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    public statuses = input.required<LinkableResult<Status>>();
    public startUrl = input.required<string>();
    public squareImages = input(false);
    public hideAvatars = input(false);

    protected galleryColumns = signal<GalleryColumn[]>([]);
    protected alwaysShowNSFW = signal(false);
    protected avatarVisible = signal(true);
    protected isBrowser = signal(false);
    protected statusesExists = computed(() => (this.internalStatuses().data.length ?? 0) > 0);

    private internalStatuses = signal<LinkableResult<Status>>(new LinkableResult<Status>());
    private isReady = false;
    private columns = 3;
    private isDuringLoadingMode = false;
    
    private galleryBreakpointSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;
    private readonly amountOfPriorityImages = 8;
    private readonly minimalFileSize = 1;
    private isReadyTimeout?: NodeJS.Timeout;
    private currentUrl?: string;

    private routeNavigationEndSubscription?: Subscription;

    private platformId = inject(PLATFORM_ID);
    private loadingService = inject(LoadingService);
    private preferencesService = inject(PreferencesService);
    private router = inject(Router);
    private contextStatusesService = inject(ContextStatusesService);
    private galleryBreakpointObserver = inject(BreakpointObserver);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));

        effect(() => {
            const inputStatuses = this.statuses();
            const copyStatuses = LinkableResult.copy(inputStatuses);

            this.internalStatuses.set(copyStatuses);
            this.contextStatusesService.setContextStatuses(copyStatuses);
            this.buildGallery(copyStatuses);
        });
    }

    override ngOnInit(): void {
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);

        this.galleryBreakpointSubscription = this.galleryBreakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
            if (result.matches) {
                this.columns = this.squareImages() ? 3 : 1;
                this.avatarVisible.set(!this.squareImages());
                this.buildGallery(this.internalStatuses());
            } else {
                this.columns = 3;
                this.avatarVisible.set(true);
                this.buildGallery(this.internalStatuses());
            }
        });

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                this.currentUrl = navigationEndEvent.urlAfterRedirects.split('?')[0];
            });

        this.isReadyTimeout = setTimeout(() => {
            this.isReady = true;
        }, 500);
    }    

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.isReadyTimeout) {
            clearTimeout(this.isReadyTimeout);
        }

        this.galleryBreakpointSubscription?.unsubscribe();
        this.routeNavigationStartSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    protected async onNearEndScroll(): Promise<void> {
        if (!this.isReady) {
            return;
        }

        if (!this.isDuringLoadingMode) {
            this.isDuringLoadingMode = true;

            if (this.currentUrl && this.startUrl() !== this.currentUrl) {
                this.isDuringLoadingMode = false;
                return;
            }

            if (this.contextStatusesService.allOlderStatusesDownloaded) {
                this.isDuringLoadingMode = false;
                return;
            }

            if (!this.internalStatuses().data.length) {
                this.isDuringLoadingMode = false;
                return;
            }

            this.loadingService.showLoader();

            const olderStatuses = await this.contextStatusesService.loadOlder();
            this.appendToGallery(olderStatuses);

            this.loadingService.hideLoader();
            this.isDuringLoadingMode = false;
        }
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    private buildGallery(statusesArray: LinkableResult<Status> | undefined): void {
        const columns: GalleryColumn[] = [];

        for(let i = 0; i < this.columns; i++) {
            columns.push(new GalleryColumn(i + 1));
        }

        if (!statusesArray) {
            this.galleryColumns.set(columns);
            return;
        }

        for (const [index, status] of statusesArray.data.entries()) {
            const imageHeight = this.getImageConstraintHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(columns, imageHeight);

            columns[smallerColumnIndex].size = columns[smallerColumnIndex].size + imageHeight;
            columns[smallerColumnIndex].statuses.push(new GalleryStatus(status, index < this.amountOfPriorityImages));
        }

        this.galleryColumns.set(columns);
    }

    private appendToGallery(statusesArray: LinkableResult<Status> | null): void {
        if (!statusesArray) {
            return;
        }

        const columns = this.galleryColumns();

        // Create temporary array for new statuses (with columns configuration).
        const internalColumns: GalleryColumn[] = [];
        for (const column of columns) {
            const galleryColumn = new GalleryColumn(column.columnId);
            galleryColumn.size = column.size;

            internalColumns.push(galleryColumn);
        }
        
        // Append new statuses to temporary array.
        for (const status of statusesArray.data) {
            const imageHeight = this.getImageConstraintHeight(status);
            const smallerColumnIndex = this.getSmallerColumnIndex(internalColumns, imageHeight);

            internalColumns[smallerColumnIndex].size = internalColumns[smallerColumnIndex].size + imageHeight;
            internalColumns[smallerColumnIndex].statuses.push(new GalleryStatus(status, false));
        }

        // Update internal list of statuses (used to rebuild when size of screen is changed).
        this.internalStatuses.update((value) => LinkableResult.copy(value));

        // Update in one step columns signal (to reduce DOM manipulations).
        this.galleryColumns.update(columns => {
            for (let i = 0; i < internalColumns.length; i++) {
                columns[i].statuses = columns[i].statuses.concat(internalColumns[i].statuses);
                columns[i].size = internalColumns[i].size;
            }
            return [...columns];
        });        
    }

    private getSmallerColumnIndex(galleryColumns: GalleryColumn[], currentImageHeight: number): number {
        let index = 0;
        let minSize = 999999999;

        for(let i = galleryColumns.length - 1; i >= 0; i--) {
            if ((galleryColumns[i].size + currentImageHeight) <= minSize) {
                minSize = galleryColumns[i].size + currentImageHeight;
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

    private getImageConstraintHeight(status: Status): number {
        if (this.squareImages()) {
            return this.minimalFileSize;
        }

        const mainAttachment = this.getMainAttachment(status);

        const height = mainAttachment?.originalFile?.height ?? this.minimalFileSize;
        const width = mainAttachment?.originalFile?.width ?? this.minimalFileSize;

        return height / width;
    }
}
