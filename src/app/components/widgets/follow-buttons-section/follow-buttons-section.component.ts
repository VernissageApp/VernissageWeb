import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { MuteAccountDialog } from 'src/app/dialogs/mute-account-dialog/mute-account.dialog';
import { ReportData } from 'src/app/dialogs/report-dialog/report-data';
import { ReportDialog } from 'src/app/dialogs/report-dialog/report.dialog';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { WindowService } from 'src/app/services/common/window.service';
import { FollowRequestsService } from 'src/app/services/http/follow-requests.service';
import { ReportsService } from 'src/app/services/http/reports.service';
import { UsersService } from 'src/app/services/http/users.service';

@Component({
    selector: 'app-follow-buttons-section',
    templateUrl: './follow-buttons-section.component.html',
    styleUrls: ['./follow-buttons-section.component.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowButtonsSectionComponent implements OnInit {
    @Input() user?: User;
    @Input() relationship?: Relationship;
    @Input() singleButton = false;
    @Output() relationChanged = new EventEmitter<Relationship>();

    isDuringRelationshipAction = false;
    isProfileOwner = false;
    showFollowButton = false;
    showUnfollowButton = false;
    showApproveFollowButton = false;
    showOpenOriginalProfileButton = false;
    showMuteButton = false;
    showUnmuteButton = false;
    showReportButton = false;
    signedInUser?: User;

    constructor(
        private usersService: UsersService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private followRequestsService: FollowRequestsService,
        private reportsService: ReportsService,
        private windowService: WindowService,
        private dialog: MatDialog,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.signedInUser = this.authorizationService.getUser();
        this.isProfileOwner = this.signedInUser?.id === this.user?.id;

        this.recalculateRelationship();
    }

    onOriginalProfile(): void {
        if (this.user?.activityPubProfile) {
            this.windowService.openPage(this.user.activityPubProfile);
        }
    }

    openMuteAccountDialog(): void {
        const dialogRef = this.dialog.open(MuteAccountDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    if (this.user?.userName) {
                        this.relationship = await this.usersService.mute(this.user?.userName, result);
                        this.recalculateRelationship();

                        this.changeDetectorRef.detectChanges();
                        this.relationChanged.emit(this.relationship);
                        this.messageService.showSuccess('Mute has been saved.');
                    }
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    toggleChange(event: MatButtonToggleChange) {
        event.source.buttonToggleGroup.value = '';
    }

    async unmuteAccount(): Promise<void> {
        try {
            if (this.user?.userName) {
                this.relationship = await this.usersService.unmute(this.user?.userName);
                this.recalculateRelationship();

                this.changeDetectorRef.detectChanges();
                this.relationChanged.emit(this.relationship);
                this.messageService.showSuccess('Mute has been canceled.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async onReportDialog(): Promise<void> {
        const dialogRef = this.dialog.open(ReportDialog, {
            width: '500px',
            data: new ReportData(this.user, undefined)
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

    async onFollow(): Promise<void> {
        if (this.user?.userName) {
            try {
                this.isDuringRelationshipAction = true;
                this.relationship = await this.usersService.follow(this.user?.userName);
                this.recalculateRelationship();

                this.changeDetectorRef.detectChanges();
                this.relationChanged.emit(this.relationship);
                this.messageService.showSuccess('You are following the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction = false;
            }
        }
    }

    async onUnfollow(): Promise<void> {
        if (this.user?.userName) {
            try {
                this.isDuringRelationshipAction = true;
                this.relationship = await this.usersService.unfollow(this.user?.userName);
                this.recalculateRelationship();

                this.changeDetectorRef.detectChanges();
                this.relationChanged.emit(this.relationship);
                this.messageService.showSuccess('You are unfollowed the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction = false;
            }
        }
    }

    async onApproveFollow(): Promise<void> {
        if (this.user?.id && this.user?.userName) {
            try {
                this.isDuringRelationshipAction = true;
                this.relationship = await this.followRequestsService.approve(this.user?.id);
                this.recalculateRelationship();

                this.changeDetectorRef.detectChanges();
                this.relationChanged.emit(this.relationship);
                this.messageService.showSuccess('User is now following you.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction = false;
            }
        }
    }

    async onRejectFollow(): Promise<void> {
        if (this.user?.id && this.user?.userName) {
            try {
                this.isDuringRelationshipAction = true;
                this.relationship = await this.followRequestsService.reject(this.user?.id);
                this.recalculateRelationship();

                this.changeDetectorRef.detectChanges();
                this.relationChanged.emit(this.relationship);
                this.messageService.showSuccess('User is now following you.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction = false;
            }
        }
    }

    private shouldShowFollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        if (this.relationship?.following === true) {
            return false;
        }

        if (this.relationship?.requested === true) {
            return false;
        }

        return true;
    }

    private shouldShowUnfollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        if ((this.relationship?.following ?? false) === false && (this.relationship?.requested ?? false) == false) {
            return false;
        }

        return true;
    }

    private shouldShowApproveFollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        if ((this.relationship?.requestedBy ?? false) === false) {
            return false;
        }

        return true;
    }

    private shouldShowOpenOriginalProfileButton(): boolean {
        if (this.signedInUser?.id === this.user?.id) {
            return false;
        }

        if (this.user?.activityPubProfile?.startsWith(this.windowService.apiUrl())) {
            return false;
        }

        return true;
    }

    private shouldShowMuteButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        const isMuted = this.relationship?.mutedStatuses ||  this.relationship?.mutedReblogs || this.relationship?.mutedNotifications;
        return isMuted === null || isMuted === false;
    }

    private shouldShowUnnuteButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        const isMuted = this.relationship?.mutedStatuses ||  this.relationship?.mutedReblogs || this.relationship?.mutedNotifications;
        return isMuted === true;
    }

    private shouldShowReportButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.user?.id) {
            return false;
        }

        return true;
    }

    private recalculateRelationship(): void {
        this.showFollowButton = this.shouldShowFollowButton();
        this.showUnfollowButton = this.shouldShowUnfollowButton();
        this.showApproveFollowButton = this.shouldShowApproveFollowButton();
        this.showOpenOriginalProfileButton = this.shouldShowOpenOriginalProfileButton();
        this.showMuteButton = this.shouldShowMuteButton();
        this.showUnmuteButton = this.shouldShowUnnuteButton();
        this.showReportButton = this.shouldShowReportButton();
    }
}
