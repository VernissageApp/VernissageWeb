import {ChangeDetectorRef, Component, ElementRef, Inject, ViewChild, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { showOrHideAnimation } from 'src/app/animations/show-or-hide.animation';
import { decode } from 'blurhash';
import { Subscription } from 'rxjs';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Status } from 'src/app/models/status';
import { Exif } from 'src/app/models/exif';
import { Location } from 'src/app/models/location';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
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
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta, SafeHtml, Title } from '@angular/platform-browser';
import { LoadingService } from 'src/app/services/common/loading.service';


@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
    animations: [fadeInAnimation, showOrHideAnimation]
})
export class StatusPage extends ResponsiveComponent implements OnInit, OnDestroy {
    readonly statusVisibility = StatusVisibility;
    readonly avatarSize = AvatarSize;

    @ViewChild('canvas', { static: false }) readonly canvas?: ElementRef<HTMLCanvasElement>;

    isReady = false;
    status?: Status;
    comments?: StatusComment[];
    mainStatus?: Status;
    routeParamsSubscription?: Subscription;
    routeNavigationEndSubscription?: Subscription;
    signedInUser?: User;
    replyStatus?: Status;
    images?: GalleryItem[];
    imageIsLoaded = false;
    showSensitiveImage = false;
    firstCanvasInitialization = false;
    urlToGallery?: string;

    isBrowser = false;
    galleryAutoheight = false;
    currentIndex = 0;
    hideLeftArrow = false;
    hideRightArrow = false;
    showAlternativeText = false;
    galleryId = 'statusPageLightbox';
    imageWidth = 32;
    imageHeight = 32;
    blurhash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    isLoggedIn = false;
    rendered?: SafeHtml = '';

    constructor(
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) platformId: object,
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private reportsService: ReportsService,
        private contextStatusesService: ContextStatusesService,
        private preferencesService: PreferencesService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private routingStateService: RoutingStateService,
        private dialog: MatDialog,
        private gallery: Gallery,
        private lightbox: Lightbox,
        private changeDetectorRef: ChangeDetectorRef,
        private windowService: WindowService,
        private titleService: Title,
        private loadingService: LoadingService,
        private metaService: Meta,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.isReady = false;

        this.urlToGallery = this.routingStateService.getPreviousUrl();
        this.showAlternativeText = this.preferencesService.showAlternativeText;

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            const statusId = params['id'] as string;

            this.signedInUser = this.authorizationService.getUser();
            this.isLoggedIn = await  this.authorizationService.isLoggedIn();
            await this.loadPageData(statusId);

            const galleryRef = this.gallery.ref(this.galleryId);
            galleryRef.load(this.images ?? []);

            this.loadingService.hideLoader();
            this.isReady = true;

            if (!this.firstCanvasInitialization) {
                this.changeDetectorRef.detectChanges();

                setTimeout(() => {
                    this.drawCanvas();
                });
            }
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
    }

    onImageLoaded(): void {
        this.imageIsLoaded = true;
    }

    trackByCommentFn(_: number, item: StatusComment): string | undefined{
        return item.status.id;
    }

    openInFullScreen() {
        this.lightbox.open(this.currentIndex, this.galleryId, {
            panelClass: 'fullscreen'
        });
    }

    onBackClick(): void {
        history.back();
    }

    async onPrevClick(): Promise<void> {
        if (this.status?.id) {
            const previousStatus = await this.contextStatusesService.getPrevious(this.status?.id);
            if (previousStatus) {
                if (this.isHandset) {
                    this.loadingService.showLoader();
                }

                await this.router.navigate(['/statuses', previousStatus.id], { replaceUrl: true });
                this.hideRightArrow = false;
                this.windowService.scrollToTop();
            } else {
                this.hideLeftArrow = true;
            }
        }
    }

    async onNextClick(): Promise<void> {
        if (this.status?.id) {
            const nextStatus = await this.contextStatusesService.getNext(this.status?.id);
            if (nextStatus) {
                if (this.isHandset) {
                    this.loadingService.showLoader();
                }

                await this.router.navigate(['/statuses', nextStatus.id], { replaceUrl: true });
                this.hideLeftArrow = false;
                this.windowService.scrollToTop();
            } else {
                this.hideRightArrow = true;
            }
        }
    }

    protected override onHandsetPortrait(): void {
        this.galleryAutoheight = true;
    }

    protected override onHandsetLandscape(): void {
        this.galleryAutoheight = true;
    }

    protected override onTablet(): void {
        this.galleryAutoheight = false;
    }

    protected override onBrowser(): void {
        this.galleryAutoheight = false;
    }

    onImageIndexChange(event: any): void {
        this.currentIndex = event.currIndex;
    }

    async onReportDialog(reportedStatus: Status): Promise<void> {
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

    async onDeleteStatus(): Promise<void> {
        const dialogRef = this.dialog.open(DeleteStatusDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result && this.status?.id) {
                try {
                    await this.statusesService.delete(this.status?.id);

                    this.messageService.showSuccess('Status has been deleted.');
                    await this.router.navigate(['/']);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    async onDeleteComment(comment: Status): Promise<void> {
        const dialogRef = this.dialog.open(DeleteStatusDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result && comment?.id) {
                try {
                    await this.statusesService.delete(comment?.id);
                    this.messageService.showSuccess('Status has been deleted.');

                    if (this.mainStatus) {
                        this.comments = await this.getAllReplies(this.mainStatus.id);
                    }
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    async onBoostedByDialog(): Promise<void> {
        if (!this.mainStatus?.id) {
            return;
        }

        this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(this.mainStatus.id, UsersListType.reblogged, 'Boosted by')
        });
    }

    async onFavouritedByDialog(): Promise<void> {
        if (!this.mainStatus?.id) {
            return;
        }

        this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(this.mainStatus.id, UsersListType.favourited, 'Favourited by')
        });
    }

    onOpenOrginalPage(): void {
        if (!this.mainStatus?.activityPubUrl) {
            return;
        }

        this.windowService.openPage(this.mainStatus.activityPubUrl);
    }

    showBackArrow(): boolean {
        return !this.isHandset && !!this.urlToGallery;
    }

    showContextArrows(): boolean {
        return this.contextStatusesService.hasContextStatuses() && !this.isHandset;
    }

    showBottomContextArrow(): boolean {
        return this.contextStatusesService.hasContextStatuses() && this.isHandset;
    }

    shouldDisplayDeleteButton(): boolean {
        return this.isStatusOwner() || this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    shouldDisplayFeatureButton(): boolean {
        return this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    shouldDisplayDeleteCommentButton(comment: Status): boolean {
        return comment.user?.id === this.signedInUser?.id;
    }

    isStatusOwner(): boolean {
        return this.mainStatus?.user?.id === this.signedInUser?.id;
    }

    getAltStatus(index: number): string | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.description;
        }

        return undefined;        
    }

    getExif(index: number): Exif | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.metadata?.exif;
        }

        return undefined;
    }

    getLocation(index: number): Location | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.location;
        }

        return undefined;
    }

    getLicense(index: number): License | undefined {
        const attachment = this.mainStatus?.attachments?.at(index);
        if (attachment) {
            return attachment.license;
        }

        return undefined;
    }

    getMapsUrl(index: number): string | undefined {
        const location = this.getLocation(index);
        if (location) {
            const latitude = this.getGpsLatitude(index) ?? location.latitude?.replace(',', '.');
            const longitude = this.getGpsLongitude(index) ?? location.longitude?.replace(',', '.');
            
            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        if (this.hasGpsCoordinations(index)) {
            const latitude = this.getGpsLatitude(index);
            const longitude = this.getGpsLongitude(index);
            
            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        return undefined;
    }

    hasGpsCoordinations(index: number): boolean {
        return !!this.getGpsLatitude(index) && !!this.getGpsLongitude(index);
    }

    getGpsLatitude(index: number): string | undefined {
        const exif = this.getExif(index);
        if (!exif) {
            return undefined;
        }

        if (exif.latitude) {
            return exif.latitude?.replace(',', '.');
        }

        return undefined;
    }

    getGpsLatitudeToDisplay(index: number): string {
        return this.getGpsLatitude(index)?.slice(0, 6) ?? '';
    }

    getGpsLongitude(index: number): string | undefined {
        const exif = this.getExif(index);
        if (!exif) {
            return undefined;
        }

        if (exif.latitude) {
            return exif.longitude?.replace(',', '.');
        }

        return undefined;
    }

    getGpsLongitudeToDisplay(index: number): string {
        return this.getGpsLongitude(index)?.slice(0, 6) ?? '';
    }

    getCreatedAt(): Date | undefined {
        if (this.mainStatus?.createdAt) {
            return new Date(this.mainStatus.createdAt);
        }

        return undefined;
    }

    async reblog(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.reblog(this.mainStatus.id);
                this.messageService.showSuccess('Status boosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unreblog(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unreblog(this.mainStatus.id);
                this.messageService.showSuccess('Status unboosted.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async favourite(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.favourite(this.mainStatus.id);
                this.messageService.showSuccess('Status favourited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unfavourite(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unfavourite(this.mainStatus.id);
                this.messageService.showSuccess('Status unfavorited.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async bookmark(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.bookmark(this.mainStatus.id);
                this.messageService.showSuccess('Status bookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unbookmark(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unbookmark(this.mainStatus.id);
                this.messageService.showSuccess('Status unbookmarked.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async feature(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.feature(this.mainStatus.id);
                this.messageService.showSuccess('Status featured.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unfeature(): Promise<void> {
        try {
            if (this.mainStatus) {
                this.mainStatus = await this.statusesService.unfeature(this.mainStatus.id);
                this.messageService.showSuccess('Status unfeatured.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async favouriteComment(status: Status): Promise<void> {
        try {
            await this.statusesService.favourite(status.id);
            status.favourited = true;

            this.messageService.showSuccess('Comment favourited.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async unfavouriteComment(status: Status): Promise<void> {
        try {
            await this.statusesService.unfavourite(status.id);
            status.favourited = false;

            this.messageService.showSuccess('Comment favourited.');
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    onReply(status?: Status): void {
        this.replyStatus = status;
    }

    async onCommentAdded(): Promise<void> {
        if (this.mainStatus) {
            this.onReply(undefined);
            this.comments = await this.getAllReplies(this.mainStatus.id);
        }
    }

    private async loadPageData(statusId: string): Promise<void> {
        this.status = await this.statusesService.get(statusId);
        
        if (this.status.reblog) {
            this.mainStatus = this.status.reblog;
        } else {
            this.mainStatus = this.status;
        }

        this.setBlurhash();
        this.setImageWidth();
        this.setImageHeight();
        this.setCardMetatags();

        this.imageIsLoaded = false;
        this.showSensitiveImage = !this.mainStatus.sensitive;

        this.images = this.mainStatus?.attachments?.map(attachment => {
            return new ImageItem({ src: attachment.originalFile?.url, thumb: attachment.smallFile?.url })
        });

        this.rendered = this.mainStatus?.noteHtml ?? '';
        this.changeDetectorRef.detectChanges();

        this.comments = await this.getAllReplies(this.mainStatus.id);
    }

    private async getAllReplies(statusId: string): Promise<StatusComment[]> {
        const replies: StatusComment[] = [];

        const context = await this.statusesService.context(statusId);
        for (const item of context.descendants) {
            replies.push(new StatusComment(item, true));
            await this.getReplies(item.id, replies);
        }

        return replies;
    }

    private async getReplies(statusId: string, replies: StatusComment[]): Promise<void> {
        const context = await this.statusesService.context(statusId);
        for (const item of context.descendants) {
            replies.push(new StatusComment(item, false));
            await this.getReplies(item.id, replies);
        }
    }

    private setBlurhash(): void {
        if (!this.mainStatus?.attachments || this.mainStatus?.attachments?.length === 0) {
            return;
        }

        this.blurhash =  this.mainStatus.attachments[0].blurhash ?? 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
        setTimeout(() => {
            this.drawCanvas();
        });
    }

    private setImageWidth(): void {
        if (!this.mainStatus?.attachments || this.mainStatus?.attachments?.length === 0) {
            return;
        }

        const width = this.mainStatus.attachments[0].smallFile?.width;
        if (!width) {
            return;
        }

        this.imageWidth = width;
    }

    private setImageHeight(): void {
        if (!this.mainStatus?.attachments || this.mainStatus?.attachments?.length === 0) {
            return;
        }

        const height = this.mainStatus.attachments[0].smallFile?.height;
        if (!height) {
            return;
        }

        this.imageHeight = height;
    }

    private drawCanvas(): void {
        if (!this.isBrowser) {
            return;
        }

        if (!this.canvas) {
            return;
        }

        const ctx = this.canvas.nativeElement.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
        const imageData = ctx.createImageData(this.imageWidth, this.imageHeight);
        if (!imageData) {
            return;
        }

        const pixels = decode(this.blurhash, this.imageWidth, this.imageHeight);
        imageData.data.set(pixels);
        ctx.putImageData(imageData!, 0, 0);

        this.firstCanvasInitialization = true;
    }

    private setCardMetatags(): void {
        const statusTitle = (this.mainStatus?.user?.name ?? '') + ` (@${this.mainStatus?.user?.userName ?? ''})`;
        const statusDescription = this.htmlToText(this.mainStatus?.note ?? '');

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(statusTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: statusDescription });

        // <meta property="og:url" content="https://vernissage.xxx/@user/112348668082695358">
        this.metaService.updateTag({ property: 'og:url', content: this.windowService.getApplicationUrl() });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: statusTitle });

        // <meta property="og:description" content="Somethinf apps next?">
        this.metaService.updateTag({ property: 'og:description', content: statusDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `https://${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        if (this.status?.attachments && this.status?.attachments.length > 0) {
            const firstImage = this.status?.attachments[0];

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

    htmlToText(value: string): string {
        const temp = this.document.createElement('div');
        temp.innerHTML = value;
        return temp.textContent || temp.innerText || '';
    }
}
