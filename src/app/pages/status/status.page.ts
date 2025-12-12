import { Component, HostListener, ElementRef, OnInit, OnDestroy, PLATFORM_ID, signal, viewChild, computed, ChangeDetectionStrategy, inject, model, DOCUMENT } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { decode } from 'blurhash';
import { combineLatest, map, Subscription } from 'rxjs';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Status } from 'src/app/models/status';
import { Exif } from 'src/app/models/exif';
import { Location } from 'src/app/models/location';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { StatusComment } from 'src/app/models/status-comment';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { ReportDialog } from 'src/app/dialogs/report-dialog/report.dialog';
import { MatDialog } from '@angular/material/dialog';
import { ReportData } from 'src/app/dialogs/report-dialog/report-data';
import { ReportsService } from 'src/app/services/http/reports.service';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Role } from 'src/app/models/role';
import { DeleteStatusDialog } from 'src/app/dialogs/delete-status-dialog/delete-status.dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UsersDialog } from 'src/app/dialogs/users-dialog/users.dialog';
import { UsersDialogContext, UsersListType } from 'src/app/dialogs/users-dialog/users-dialog-context';
import { License } from 'src/app/models/license';
import { WindowService } from 'src/app/services/common/window.service';
import { RoutingStateService } from 'src/app/services/common/routing-state.service';
import { isPlatformBrowser } from '@angular/common';
import { Meta, SafeHtml, Title } from '@angular/platform-browser';
import { LoadingService } from 'src/app/services/common/loading.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FocusTrackerService } from 'src/app/services/common/focus-tracker.service';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';

@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly avatarSize = AvatarSize;
    protected isReady = signal(false);
    protected status = signal<Status | undefined>(undefined);
    protected mainStatus = signal<Status | undefined>(undefined);
    protected comments = signal<StatusComment[] | undefined>(undefined);
    protected signedInUser = signal<User | undefined>(undefined);
    protected replyStatus =  signal<Status | undefined>(undefined);
    protected images = signal<GalleryItem[] | undefined>(undefined);
    protected imageIsLoaded = signal(false);
    protected showSensitiveImage = signal(false);
    protected showSensitiveCanvas = signal(false);
    protected galleryAutoheight = signal(false);
    protected currentIndex = signal(0);
    protected hideLeftArrow = signal(false);
    protected hideRightArrow = signal(false);
    protected showAlternativeText = signal(false);
    protected alwaysShowNSFW = signal(false);
    protected autoScrollGalleryImages = signal(true);
    protected imageWidth = signal(32);
    protected imageHeight = signal(32);
    protected isLoggedIn = signal(false);
    protected rendered = signal<SafeHtml>('');
    protected hasHdrSupport = signal(false);

    protected versionId = model<string>('');
    protected versions = signal<Status[]>([]);
    protected isInVersionMode = signal(false);

    protected isDuringBoostProcessing = signal(false);
    protected isDuringFavouriteProcessing = signal(false);
    protected isDuringBookmarkProcessing = signal(false);
    protected isDuringFeatureProcessing = signal(false);

    protected altStatus = computed(() => this.getAltStatus(this.currentIndex()));
    protected location = computed(() => this.getLocation(this.currentIndex()));
    protected license = computed(() => this.getLicense(this.currentIndex()));
    protected exif = computed(() => this.getExif(this.currentIndex()));
    protected mapsUrl = computed(() => this.getMapsUrl(this.currentIndex()));
    protected gpsLatitudeToDisplay = computed(() => this.getGpsLatitude(this.currentIndex())?.slice(0, 10) ?? '');
    protected gpsLongitudeToDisplay = computed(() => this.getGpsLongitude(this.currentIndex())?.slice(0, 10) ?? '');
    protected hasGpsCoordinations = computed<boolean>(() => !!this.getGpsLatitude(this.currentIndex()) && !!this.getGpsLongitude(this.currentIndex()));
    protected hasHdrVersion = computed<boolean>(() => this.showHdrIcon(this.currentIndex()));
    protected isBrowser = signal(false);

    private canvas = viewChild<ElementRef<HTMLCanvasElement> | undefined>('canvas');
    private routeParamsSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;
    private readonly oneSecond = 1000;
    private firstCanvasInitialization = false;
    private urlToGallery?: string;
    private popupGalleryId = 'popupGalleryId';
    private mainGalleryId = 'mainGalleryId';
    private blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

    private document = inject(DOCUMENT);
    private platformId = inject(PLATFORM_ID);
    private statusesService = inject(StatusesService);
    private messageService = inject(MessagesService);
    private authorizationService = inject(AuthorizationService);
    private reportsService = inject(ReportsService);
    private contextStatusesService = inject(ContextStatusesService);
    private preferencesService = inject(PreferencesService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private routingStateService = inject(RoutingStateService);
    private dialog = inject(MatDialog);
    private gallery = inject(Gallery);
    private lightbox = inject(Lightbox);
    private windowService = inject(WindowService);
    private titleService = inject(Title);
    private loadingService = inject(LoadingService);
    private metaService = inject(Meta);
    private deviceDetectorService = inject(DeviceDetectorService);
    private clipboard = inject(Clipboard);
    private focusTrackerService = inject(FocusTrackerService);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.isReady.set(false);
        this.loadingService.showLoader();

        this.urlToGallery = this.routingStateService.getPreviousUrl();
        this.showAlternativeText.set(this.preferencesService.showAlternativeText);
        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
        this.autoScrollGalleryImages.set(this.preferencesService.autoScrollGalleryImages);
        this.hasHdrSupport.set(this.isHdrRendered());

        this.routeParamsSubscription = combineLatest([this.activatedRoute.params, this.activatedRoute.queryParamMap])
            .pipe(map(params => ({ routeParams: params[0], queryParams: params[1] })))
            .subscribe(async params => {
                const statusId = params.routeParams['id'] as string;

                if (params.queryParams.has('version')) {
                    const internalVersionId = params.queryParams.get('version');
                    this.versionId.set(internalVersionId ?? '');
                    this.isInVersionMode.set(true);
                } else {
                    this.isInVersionMode.set(false);
                    this.versionId.set('');
                }

                const signedInUserInternal = this.authorizationService.getUser()
                const isLoggedInInternal = await  this.authorizationService.isLoggedIn();

                this.signedInUser.set(signedInUserInternal);
                this.isLoggedIn.set(isLoggedInInternal);
                this.currentIndex.set(0);

                // Load status information.
                await this.loadPageData(statusId);

                // Load images to gallery (and reset gallery state).
                const mainGallery = this.gallery.ref(this.mainGalleryId);
                mainGallery.load(this.images() ?? []);
                mainGallery.set(0);

                // Load images to popup gallery.
                const popupGallery = this.gallery.ref(this.popupGalleryId);
                popupGallery.load(this.images() ?? []);

                this.setNoIndexMeta();

                this.loadingService.hideLoader();
                this.isReady.set(true);

                if (!this.firstCanvasInitialization) {
                    setTimeout(() => {
                        this.drawCanvas();
                    });
                }
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.clearNoIndexMeta();
        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    protected onVersionChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { version: this.versionId().length > 0 ?  this.versionId() : undefined },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected onImageLoaded(): void {
        this.imageIsLoaded.set(true);
    }

    protected openInFullScreen() {
        this.lightbox.open(this.currentIndex(), this.popupGalleryId, {
            panelClass: 'fullscreen'
        });
    }

    protected onBackClick(): void {
        history.back();
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (this.focusTrackerService.isCurrentlyFocused || event.repeat || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        switch (event.key) {
            case 'ArrowRight':
                this.onNextClick();
                break;
            case 'ArrowLeft':
                this.onPrevClick();
                break;
            case 'l':
                this.toggleFavourite();
                break;
            case 'b':
                this.toggleReblog();
                break;
            case 's':
                this.toggleBookmark();
                break;
        }
    }

    protected async onPrevClick(): Promise<void> {
        const internalStatus = this.status();

        if (internalStatus?.id) {
            const previousStatus = await this.contextStatusesService.getPrevious(internalStatus.id);
            if (previousStatus) {
                if (this.isHandset()) {
                    this.loadingService.showLoader();
                }

                await this.router.navigate(['/statuses', previousStatus.id], { replaceUrl: true });
                this.hideRightArrow.set(false);
                this.windowService.scrollToTop();
            } else {
                this.hideLeftArrow.set(true);
            }
        }
    }

    protected async onNextClick(): Promise<void> {
        const internalStatus = this.status();

        if (internalStatus?.id) {
            const nextStatus = await this.contextStatusesService.getNext(internalStatus.id);
            if (nextStatus) {
                if (this.isHandset()) {
                    this.loadingService.showLoader();
                }

                await this.router.navigate(['/statuses', nextStatus.id], { replaceUrl: true });
                this.hideLeftArrow.set(false);
                this.windowService.scrollToTop();
            } else {
                this.hideRightArrow.set(true);
            }
        }
    }

    protected onShowSensitiveImageClick(): void {
        this.showSensitiveImage.set(true);

        setTimeout(() => {
            this.showSensitiveCanvas.set(false);
        }, this.oneSecond);
    }

    protected override onHandsetPortrait(): void {
        this.galleryAutoheight?.set(true);
    }

    protected override onHandsetLandscape(): void {
        this.galleryAutoheight?.set(true);
    }

    protected override onTablet(): void {
        this.galleryAutoheight?.set(false);
    }

    protected override onBrowser(): void {
        this.galleryAutoheight?.set(false);
    }

    protected onImageIndexChange(event: any): void {
        this.currentIndex.set(event.currIndex);
    }

    protected async onReportDialog(reportedStatus: Status): Promise<void> {
        const dialogRef = this.dialog.open(ReportDialog, {
            width: '500px',
            data: new ReportData(reportedStatus?.user, reportedStatus)
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.reportsService.create(result);
                    this.messageService.showSuccess('Report has been saved.');
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected async onDeleteStatus(): Promise<void> {
        const dialogRef = this.dialog.open(DeleteStatusDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            const internalStatus = this.status();

            if (result && internalStatus?.id) {
                try {
                    await this.statusesService.delete(internalStatus.id);

                    this.messageService.showSuccess('Status has been deleted.');
                    await this.router.navigate(['/']);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected async onEditStatus(): Promise<void> {
        await this.router.navigate(['/statuses', this.status()?.id, 'edit']);
    }

    protected async onStatusEvents(): Promise<void> {
        await this.router.navigate(['/statuses', this.status()?.id, 'events']);
    }

    protected async onDeleteComment(comment: Status): Promise<void> {
        const dialogRef = this.dialog.open(DeleteStatusDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result && comment?.id) {
                try {
                    await this.statusesService.delete(comment?.id);
                    this.messageService.showSuccess('Status has been deleted.');

                    const internalMainStatus = this.mainStatus();
                    if (internalMainStatus) {
                        const downloadedComments = await this.getAllReplies(internalMainStatus.id);
                        this.comments.set(downloadedComments);
                    }
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected async onBoostedByDialog(): Promise<void> {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.id) {
            return;
        }

        this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(internalMainStatus.id, UsersListType.reblogged, 'Boosted by')
        });
    }

    protected async onFavouritedByDialog(): Promise<void> {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.id) {
            return;
        }

        this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(internalMainStatus.id, UsersListType.favourited, 'Favourited by')
        });
    }

    protected onOpenOriginalPage(): void {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.activityPubUrl) {
            return;
        }

        this.windowService.openPage(internalMainStatus.activityPubUrl);
    }

    protected onCopyLinkToPost(): void {
        this.clipboard.copy(this.mainStatus()?.activityPubUrl ?? '');
    }

    protected showBackArrow(): boolean {
        return !this.isHandset() && !!this.urlToGallery;
    }

    protected showContextArrows(): boolean {
        return this.contextStatusesService.hasContextStatuses() && !this.isHandset();
    }

    protected showBottomContextArrow(): boolean {
        return this.contextStatusesService.hasContextStatuses() && this.isHandset();
    }

    protected shouldDisplayDeleteButton(): boolean {
        return this.isStatusOwner() || this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    protected shouldDisplayEditButton(): boolean {
        return this.isStatusOwner();
    }

    protected shouldDisplayEventsButton(): boolean {
        return this.isStatusOwner() || this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    protected shouldDisplayFeatureButton(): boolean {
        return this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    protected shouldDisplayDeleteCommentButton(comment: Status): boolean {
        return comment.user?.id === this.signedInUser()?.id;
    }

    protected async toggleReblog(): Promise<void> {
        try {
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                if (internalMainStatus.reblogged) {
                    await this.unreblog();
                } else {
                    await this.reblog();
                }
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
    protected async reblog(): Promise<void> {
        try {
            this.isDuringBoostProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.reblog(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status boosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringBoostProcessing.set(false);
        }
    }

    protected async unreblog(): Promise<void> {
        try {
            this.isDuringBoostProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.unreblog(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status unboosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringBoostProcessing.set(false);
        }
    }

    protected async toggleFavourite(): Promise<void> {
        try {
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                if (internalMainStatus.favourited) {
                    await this.unfavourite();
                } else {
                    await this.favourite();
                }
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async favourite(): Promise<void> {
        try {
            this.isDuringFavouriteProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.favourite(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status favourited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringFavouriteProcessing.set(false);
        }
    }

    protected async unfavourite(): Promise<void> {
        try {
            this.isDuringFavouriteProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadMainStatus = await this.statusesService.unfavourite(internalMainStatus.id);
                this.mainStatus.set(downloadMainStatus);
                this.messageService.showSuccess('Your like has been undone.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringFavouriteProcessing.set(false);
        }
    }

    protected async toggleBookmark(): Promise<void> {
        try {
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                if (internalMainStatus.bookmarked) {
                    await this.unbookmark();
                } else {
                    await this.bookmark();
                }
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async bookmark(): Promise<void> {
        try {
            this.isDuringBookmarkProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.bookmark(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status bookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringBookmarkProcessing.set(false);
        }
    }

    protected async unbookmark(): Promise<void> {
        try {
            this.isDuringBookmarkProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.unbookmark(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status unbookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringBookmarkProcessing.set(false);
        }
    }

    protected async feature(): Promise<void> {
        try {
            this.isDuringFeatureProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadedMainStatus = await this.statusesService.feature(internalMainStatus.id);
                this.mainStatus.set(downloadedMainStatus);
                this.messageService.showSuccess('Status featured.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringFeatureProcessing.set(false);
        }
    }

    protected async unfeature(): Promise<void> {
        try {
            this.isDuringFeatureProcessing.set(true);
            const internalMainStatus = this.mainStatus();
            if (internalMainStatus) {
                const downloadMainStatus = await this.statusesService.unfeature(internalMainStatus.id);
                this.mainStatus.set(downloadMainStatus);
                this.messageService.showSuccess('Status unfeatured.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        } finally {
            this.isDuringFeatureProcessing.set(false);
        }
    }

    protected async favouriteComment(status: Status): Promise<void> {
        try {
            await this.statusesService.favourite(status.id);
            status.favourited = true;

            this.messageService.showSuccess('Comment favourited.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async unFavouriteComment(status: Status): Promise<void> {
        try {
            await this.statusesService.unfavourite(status.id);
            status.favourited = false;

            this.messageService.showSuccess('Comment favourited.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected onReply(status?: Status): void {
        this.replyStatus.set(status);
    }

    protected async onCommentAdded(): Promise<void> {
        const internalMainStatus = this.mainStatus();
        if (internalMainStatus) {
            this.onReply(undefined);
            const downloadedComments = await this.getAllReplies(internalMainStatus.id);
            this.comments.set(downloadedComments);
        }
    }

    protected getCleanFocalLength(focalLength: string): string {
        const withoutMillimeters = focalLength.replace('mm', '').trim();
        return withoutMillimeters.split(/\.|,/)[0];
    }

    private getAltStatus(index: number): string | undefined {
        const attachment = this.mainStatus()?.attachments?.at(index);
        if (attachment) {
            return attachment.description;
        }

        return undefined;
    }

    private getExif(index: number): Exif | undefined {
        const attachment = this.mainStatus()?.attachments?.at(index);
        if (attachment) {
            return attachment.metadata?.exif;
        }

        return undefined;
    }

    private getLocation(index: number): Location | undefined {
        const attachment = this.mainStatus()?.attachments?.at(index);
        if (attachment) {
            return attachment.location;
        }

        return undefined;
    }

    private getLicense(index: number): License | undefined {
        const attachment = this.mainStatus()?.attachments?.at(index);
        if (attachment) {
            return attachment.license;
        }

        return undefined;
    }

    private getMapsUrl(index: number): string | undefined {
        const locationInternal = this.getLocation(index);
        if (locationInternal) {
            const latitude = this.getGpsLatitude(index) ?? locationInternal.latitude?.replace(',', '.');
            const longitude = this.getGpsLongitude(index) ?? locationInternal.longitude?.replace(',', '.');

            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        if (this.hasGpsCoordinations()) {
            const latitude = this.getGpsLatitude(index);
            const longitude = this.getGpsLongitude(index);

            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        return undefined;
    }

    private showHdrIcon(index: number): boolean {
        const attachment = this.mainStatus()?.attachments?.at(index);
        if (attachment) {
            return !!attachment.originalHdrFile;
        }

        return false;
    }

    private isHdrRendered(): boolean {
        if (this.preferencesService.alwaysShowSdrPhoto) {
            return false;
        }

        if (this.browserSupportsHdr()) {
            return true;
        }

        return false;
    }

    private getGpsLatitude(index: number): string | undefined {
        const exif = this.getExif(index);
        if (!exif) {
            return undefined;
        }

        if (exif.latitude) {
            let latitude = exif.latitude?.replace(',', '.').toUpperCase();

            if (latitude.endsWith('S')) {
                latitude = latitude.replace('S', '');

                if (!latitude.startsWith('-')) {
                    latitude = '-' + latitude;
                }
            }

            if (latitude.endsWith('N')) {
                latitude = latitude.replace('N', '');
            }

            return latitude;
        }

        return undefined;
    }

    private getGpsLongitude(index: number): string | undefined {
        const exif = this.getExif(index);
        if (!exif) {
            return undefined;
        }

        if (exif.longitude) {
            let longitude = exif.longitude?.replace(',', '.').toUpperCase();

            if (longitude.endsWith('W')) {
                longitude = longitude.replace('W', '');

                if (!longitude.startsWith('-')) {
                    longitude = '-' + longitude;
                }
            }

            if (longitude.endsWith('E')) {
                longitude = longitude.replace('E', '');
            }

            return longitude;
        }

        return undefined;
    }

    private async loadPageData(statusId: string): Promise<void> {
        const firstImageUrlBeforeLoad = this.getFirstImageUrl();

        const downloadedStatus = await this.getStatusData(statusId);
        this.status.set(downloadedStatus);

        if (downloadedStatus.reblog) {
            this.mainStatus.set(downloadedStatus.reblog);
        } else {
            this.mainStatus.set(downloadedStatus);
        }

        this.setBlurhash();
        this.setImageWidth();
        this.setImageHeight();
        this.setCardMetatags();

        const firstImageUrlAfterLoad = this.getFirstImageUrl();
        this.imageIsLoaded.set(firstImageUrlBeforeLoad === firstImageUrlAfterLoad);

        if (this.mainStatus()?.sensitive && !this.alwaysShowNSFW()) {
            this.showSensitiveImage.set(false);
            this.showSensitiveCanvas.set(true);
        } else {
            this.showSensitiveImage.set(true);
            this.showSensitiveCanvas.set(false);
        }

        const internalImages = this.mainStatus()?.attachments?.map(attachment => {
            if (this.preferencesService.alwaysShowSdrPhoto) {
                return new ImageItem({ src: attachment.originalFile?.url, thumb: attachment.smallFile?.url });
            }

            if (attachment.originalHdrFile?.url && this.browserSupportsHdr()) {
                return new ImageItem({ src: attachment.originalHdrFile?.url, thumb: attachment.smallFile?.url });
            }

            return new ImageItem({ src: attachment.originalFile?.url, thumb: attachment.smallFile?.url });
        });

        this.images.set(internalImages);
        this.rendered.set(this.mainStatus()?.noteHtml ?? '');

        // Load status histories asynchronously.
        this.loadStatusHistories(statusId);

        if (!this.isInVersionMode()) {
            const mainStatusId = this.mainStatus()?.id;
            if (mainStatusId) {
                const downloadedComments = await this.getAllReplies(mainStatusId);
                this.comments.set(downloadedComments);
            }
        }
    }

    private async getAllReplies(statusId: string): Promise<StatusComment[]> {
        const replies: StatusComment[] = [];

        // Download all status descendants.
        const context = await this.statusesService.context(statusId);

        // Build a tree of replies.
        for (const item of context.descendants.filter(x => x.replyToStatusId === statusId)) {
            replies.push(new StatusComment(item, true));
            this.getReplies(context.descendants, item.id, replies);
        }

        return replies;
    }

    private getReplies(allStatuses: Status[], statusId: string, replies: StatusComment[]): void {
        const descendants = allStatuses.filter(x => x.replyToStatusId === statusId);
        for (const item of descendants) {
            replies.push(new StatusComment(item, false));
            this.getReplies(allStatuses, item.id, replies);
        }
    }

    private setBlurhash(): void {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.attachments || internalMainStatus?.attachments?.length === 0) {
            return;
        }

        this.blurhash = internalMainStatus.attachments[0].blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
        setTimeout(() => {
            this.drawCanvas();
        });
    }

    private setImageWidth(): void {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.attachments || internalMainStatus?.attachments?.length === 0) {
            return;
        }

        const width = internalMainStatus.attachments[0].smallFile?.width;
        if (!width) {
            return;
        }

        this.imageWidth.set(width);
    }

    private setImageHeight(): void {
        const internalMainStatus = this.mainStatus();
        if (!internalMainStatus?.attachments || internalMainStatus?.attachments?.length === 0) {
            return;
        }

        const height = internalMainStatus.attachments[0].smallFile?.height;
        if (!height) {
            return;
        }

        this.imageHeight.set(height);
    }

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.canvas) {
            return;
        }

        const ctx = this.canvas()?.nativeElement.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, this.imageWidth(), this.imageHeight());
        const imageData = ctx.createImageData(this.imageWidth(), this.imageHeight());
        if (!imageData) {
            return;
        }

        const pixels = decode(this.blurhash, this.imageWidth(), this.imageHeight());
        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);

        this.firstCanvasInitialization = true;
    }

    private setCardMetatags(): void {
        const internalMainStatus = this.mainStatus();

        const statusTitle = (internalMainStatus?.user?.name ?? '') + ` (@${internalMainStatus?.user?.userName ?? ''})`;
        const statusDescription = this.htmlToText(internalMainStatus?.note ?? '');

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(statusTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: statusDescription });

        // <meta property="og:url" content="https://vernissage.xxx/@user/112348668082695358">
        this.metaService.updateTag({ property: 'og:url', content: `${this.windowService.getApplicationBaseUrl()}/@${internalMainStatus?.user?.userName ?? ''}/${internalMainStatus?.id ?? ''}` });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: statusTitle });

        // <meta property="og:description" content="Something apps next?">
        this.metaService.updateTag({ property: 'og:description', content: statusDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        if (internalMainStatus?.attachments && internalMainStatus?.attachments.length > 0) {
            const firstImage = internalMainStatus?.attachments[0];

            // <meta property="og:image" content="https://files.vernissage.xxx/media_attachments/files/112348.png">
            this.metaService.updateTag({ property: 'og:image', content: firstImage.smallFile?.url ?? '' });

            // <meta property="og:image:width"" content="1532">
            this.metaService.updateTag({ property: 'og:image:width', content: firstImage.smallFile?.width.toString() ?? '' });

            // <meta property="og:image:height"" content="1416">
            this.metaService.updateTag({ property: 'og:image:height', content: firstImage.smallFile?.height.toString() ?? '' });
        }

        // <meta name="twitter:card" content="summary_large_image">
        this.metaService.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    }

    private browserSupportsHdr(): boolean {
        return this.deviceDetectorService.browser === "Chrome" && this.deviceDetectorService.isDesktop();
    }

    private htmlToText(value: string): string {
        const temp = this.document.createElement('div');
        temp.innerHTML = value;
        return temp.textContent || temp.innerText || '';
    }

    private isStatusOwner(): boolean {
        return this.mainStatus()?.user?.id === this.signedInUser()?.id;
    }

    private setNoIndexMeta(): void {
        this.metaService.updateTag({ name: 'robots', content: 'noindex, noarchive' });
    }

    private clearNoIndexMeta(): void {
        this.metaService.removeTag('name="robots"');
    }

    private async getStatusData(statusId: string): Promise<Status> {
        if (this.isInVersionMode()) {
            const histories = await this.statusesService.getHistories(statusId);
            const version = histories.find(x => x.id === this.versionId());
            if (!version) {
                throw new PageNotFoundError();
            }

            return version;
        } else {
            return await this.statusesService.get(statusId);
        }
    }

    private async loadStatusHistories(statusId: string): Promise<void> {
        const histories = await this.statusesService.getHistories(statusId);
        this.versions.set(histories);
    }

    private getFirstImageUrl(): string | undefined {
        const internalAttachments = this.mainStatus()?.attachments;
        if (internalAttachments && internalAttachments.length > 0) {
            return internalAttachments[0].originalFile?.url;
        }

        return undefined;
    }
}
