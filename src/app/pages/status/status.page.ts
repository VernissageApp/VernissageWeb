import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Subscription } from 'rxjs';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Status } from 'src/app/models/status';
import { Exif } from 'src/app/models/exif';
import { Location } from 'src/app/models/location';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { MessagesService } from 'src/app/services/common/messages.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { User } from 'src/app/models/user';
import { StatusComment } from 'src/app/models/status-comment';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { ReportDialog } from 'src/app/dialogs/report-dialog/report.dialog';
import { MatDialog } from '@angular/material/dialog';
import { ReportData } from 'src/app/dialogs/report-dialog/report-data';
import { ReportsService } from 'src/app/services/http/reports.service';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { ContextStatusesService } from 'src/app/services/common/context-statuses.service';
import { Role } from 'src/app/models/role';
import { DeleteStatusDialog } from 'src/app/dialogs/delete-status-dialog/delete-status.dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UsersDialog } from 'src/app/dialogs/users-dialog/users.dialog';
import { UsersDialogContext, UsersListType } from 'src/app/dialogs/users-dialog/users-dialog-context';
import { Location as AngularLocation } from '@angular/common';

@Component({
    selector: 'app-status',
    templateUrl: './status.page.html',
    styleUrls: ['./status.page.scss'],
    animations: fadeInAnimation
})
export class StatusPage extends Responsive {
    readonly statusVisibility = StatusVisibility;
    readonly avatarSize = AvatarSize;

    isReady = false;
    status?: Status;
    comments?: StatusComment[];
    mainStatus?: Status;
    routeParamsSubscription?: Subscription;
    signedInUser?: User;
    replyStatus?: Status;
    images?: GalleryItem[];

    galleryAutoheight = false;
    currentIndex = 0;
    hideLeftArrow = false;
    hideRightArrow = false;
    showAlternativeText = false;

    constructor(
        private statusesService: StatusesService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private reportsService: ReportsService,
        private contextStatusesService: ContextStatusesService,
        private preferencesService: PreferencesService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private angularLocation: AngularLocation,
        private dialog: MatDialog,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.isReady = false;

        this.showAlternativeText = this.preferencesService.showAlternativeText;

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            const statusId = params['id'] as string;

            this.signedInUser = this.authorizationService.getUser();
            await this.loadPageData(statusId);

            this.isReady = true;
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    onBackClick(): void {
        this.angularLocation.back();
    }

    async onPrevClick(): Promise<void> {
        if (this.status?.id) {
            const previousStatus = await this.contextStatusesService.getPrevious(this.status?.id);
            if (previousStatus) {
                await this.router.navigate(['/statuses', previousStatus.id], { skipLocationChange: true });
                this.hideRightArrow = false;
            } else {
                this.hideLeftArrow = true;
            }
        }
    }

    async onNextClick(): Promise<void> {
        if (this.status?.id) {
            const nextStatus = await this.contextStatusesService.getNext(this.status?.id);
            if (nextStatus) {
                await this.router.navigate(['/statuses', nextStatus.id], { skipLocationChange: true });
                this.hideLeftArrow = false;
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

    async onReportDialog(): Promise<void> {
        const dialogRef = this.dialog.open(ReportDialog, {
            width: '500px',
            data: new ReportData(this.status?.user, this.status)
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
                    this.statusesService.delete(this.status?.id);
                    this.messageService.showSuccess('Status has been deleted.');
                    await this.router.navigate(['/']);
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    async onBoostedByDialog(): Promise<void> {
        if (!this.status?.id) {
            return;
        }

        const dialogRef = this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(this.status.id, UsersListType.reblogged, 'Boosted by')
        });
    }

    async onFavouritedByDialog(): Promise<void> {
        if (!this.status?.id) {
            return;
        }

        const dialogRef = this.dialog.open(UsersDialog, {
            width: '500px',
            data: new UsersDialogContext(this.status.id, UsersListType.favourited, 'Favourited by')
        });
    }

    isLoggedIn(): Boolean {
        return this.authorizationService.isLoggedIn();
    }

    showBackArrow(): boolean {
        return !this.isHandset;
    }

    showContextArrows(): boolean {
        return this.contextStatusesService.hasContextStatuses() && !this.isHandset;
    }

    shoudDisplayDeleteButton(): boolean {
        return this.isStatusOwner() || this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    shoudDisplayFeatureButton(): boolean {
        return this.authorizationService.hasRole(Role.Administrator) || this.authorizationService.hasRole(Role.Moderator);
    }

    isStatusOwner(): boolean {
        return this.mainStatus?.user?.id === this.signedInUser?.id;
    }

    getAltStatus(index: number): String | undefined {
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

    getMapsUrl(index: number): String | undefined {
        const location = this.getLocation(index);
        if (location) {
            const latitude = location.latitude?.replace(',', '.');
            const longitude  = location.longitude?.replace(',', '.');
            
            return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`;
        }

        return undefined;
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

    private async loadPageData(statusId: string): Promise<void> {
        this.status = await this.statusesService.get(statusId)

        if (this.status.reblog) {
            this.mainStatus = this.status.reblog;
        } else {
            this.mainStatus = this.status;
        }

        this.images = this.mainStatus.attachments?.map(attachment => {
            return new ImageItem({ src: attachment.originalFile?.url, thumb: attachment.smallFile?.url })
        }); 

        this.comments = await this.getAllReplies(this.mainStatus.id);
    }

    private async getAllReplies(statusId: string): Promise<StatusComment[]> {
        const replies: StatusComment[] = [];

        const context = await this.statusesService.context(statusId);
        for(let item of context.descendants) {
            replies.push(new StatusComment(item, true));
            await this.getReplies(item.id, replies);
        }

        return replies;
    }

    private async getReplies(statusId: string, replies: StatusComment[]): Promise<void> {
        const context = await this.statusesService.context(statusId);
        for(let item of context.descendants) {
            replies.push(new StatusComment(item, false));
            await this.getReplies(item.id, replies);
        }
    }
}
