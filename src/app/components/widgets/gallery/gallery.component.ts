import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { LinkableResult } from 'src/app/models/linkable-result';
import { Status } from 'src/app/models/status';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { GalleryStatus } from 'src/app/models/gallery-status';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { GalleryColumn } from 'src/app/models/gallery-column';
import { InfiniteScrollDirective } from '../../../directives/infinite-scroll.directive';
import { ViewportObserverDirective } from '../../../directives/viewport-observer.directive';
import { MatIcon } from '@angular/material/icon';
import { BlurhashImageComponent } from '../blurhash-image/blurhash-image.component';
import { ImageComponent } from '../image/image.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[style.--gallery-gap]': 'galleryGap + "px"' },
    imports: [InfiniteScrollDirective, ViewportObserverDirective, RouterLink, MatIcon, BlurhashImageComponent, ImageComponent, TranslatePipe, ScrollToTopComponent]
})
export class GalleryComponent extends ResponsiveComponent implements OnInit, OnDestroy {
    public statuses = input.required<LinkableResult<Status>>();
    public startUrl = input.required<string>();
    public squareImages = input(false);
    public hideAvatars = input(false);
    public highlightPinnedStatuses = input(false);

    protected readonly galleryGap = 6;
    protected galleryColumns = signal<GalleryColumn[]>([]);
    protected alwaysShowNSFW = signal(false);
    protected avatarVisible = signal(true);
    protected isBrowser = signal(false);
    protected statusesExists = computed(() => (this.internalStatuses().data.length ?? 0) > 0);
    protected viewportRootMargin = '2000px 0px 2000px 0px';
    protected viewportRefreshToken = signal(0);

    private internalStatuses = signal<LinkableResult<Status>>(new LinkableResult<Status>());
    private isReady = false;
    private columns = 3;
    private isDuringLoadingMode = false;
    
    private galleryBreakpointSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;
    private readonly amountOfPriorityImages = 8;
    private isReadyTimeout?: NodeJS.Timeout;
    private currentUrl?: string;

    private routeNavigationEndSubscription?: Subscription;

    private element = inject<ElementRef<HTMLElement>>(ElementRef);
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
            this.refreshViewportObservers();
        });
    }

    override ngOnInit(): void {
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);

        this.galleryBreakpointSubscription = this.galleryBreakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
            if (result.matches) {
                this.columns = this.squareImages() ? 3 : 1;
                this.avatarVisible.set(!this.squareImages());
                this.buildGallery(this.internalStatuses());
                this.refreshViewportObservers();
            } else {
                this.columns = 3;
                this.avatarVisible.set(true);
                this.buildGallery(this.internalStatuses());
                this.refreshViewportObservers();
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

            try {
                const context = this.contextStatusesService.statuses;
                let previousMaxId: string | undefined;
                let olderStatuses: LinkableResult<Status> | null;
                do {
                    previousMaxId = context?.maxId;
                    olderStatuses = await this.contextStatusesService.loadOlder();
                    if (context !== this.contextStatusesService.statuses) {
                        return;
                    }
                } while (olderStatuses?.maxId && olderStatuses.maxId !== previousMaxId
                    && !olderStatuses.data.some(status => this.getGalleryPreview(status)));

                this.appendToGallery(olderStatuses);
            } finally {
                this.loadingService.hideLoader();
                this.isDuringLoadingMode = false;
            }
        }
    }

    protected getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    protected onViewportChange(galleryStatus: GalleryStatus, isVisible: boolean): void {
        galleryStatus.inViewport.set(isVisible);
    }

    private refreshViewportObservers(): void {
        this.viewportRefreshToken.update(value => value + 1);
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

        this.distributeStatuses(columns, statusesArray.data, 0, true);

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
        
        const fullContextLength = this.contextStatusesService.statuses?.data.length ?? 0;
        const startIndex = Math.max(fullContextLength - statusesArray.data.length, 0);

        this.distributeStatuses(internalColumns, statusesArray.data, startIndex, false, columns.map(column => column.statuses.length));

        // Keep the fetched pages when rebuilding the gallery after a breakpoint change.
        const contextStatuses = this.contextStatusesService.statuses;
        if (contextStatuses) {
            this.internalStatuses.set(LinkableResult.copy(contextStatuses));
        }

        // Update in one step columns signal (to reduce DOM manipulations).
        this.galleryColumns.update(columns => {
            for (let i = 0; i < internalColumns.length; i++) {
                columns[i].statuses = columns[i].statuses.concat(internalColumns[i].statuses);
                columns[i].size = internalColumns[i].size;
            }
            return [...columns];
        });        
    }

    private getGalleryPreview(status: Status) {
        const preview = this.getMainStatus(status).attachments?.[0]?.smallFile;
        return preview?.url ? preview : undefined;
    }

    private distributeStatuses(
        columns: GalleryColumn[],
        statuses: Status[],
        startIndex: number,
        prioritize: boolean,
        existingCounts = columns.map(() => 0)
    ): void {
        const galleryWidth = this.element.nativeElement.clientWidth;
        const columnWidth = (galleryWidth - (columns.length - 1) * this.galleryGap) / columns.length;
        const columnHeight = (column: GalleryColumn, index: number) => {
            const gapCount = Math.max(existingCounts[index] + column.statuses.length - 1, 0);
            return columnWidth > 0 ? column.size * columnWidth + gapCount * this.galleryGap : column.size;
        };

        for (const [index, status] of statuses.entries()) {
            const preview = this.getGalleryPreview(status);
            if (!preview) {
                continue;
            }

            const width = Math.max(preview.width ?? 1, 1);
            const height = Math.max(preview.height ?? 1, 1);
            const imageHeight = this.squareImages() ? 1 : height / width;
            const columnIndex = columns.reduce((shortestIndex, candidate, index) =>
                columnHeight(candidate, index) < columnHeight(columns[shortestIndex], shortestIndex) ? index : shortestIndex, 0);
            const column = columns[columnIndex];

            column.size += imageHeight;
            column.statuses.push(new GalleryStatus(status, startIndex + index,
                prioritize && index < this.amountOfPriorityImages, `${width} / ${height}`));
        }
    }
}
