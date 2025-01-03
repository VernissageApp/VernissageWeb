import { ChangeDetectionStrategy, Component, computed, input, OnInit, output, signal } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { MuteAccountDialog } from 'src/app/dialogs/mute-account-dialog/mute-account.dialog';
import { ReportData } from 'src/app/dialogs/report-dialog/report-data';
import { ReportDialog } from 'src/app/dialogs/report-dialog/report.dialog';
import { Relationship } from 'src/app/models/relationship';
import { Role } from 'src/app/models/role';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FollowButtonsSectionComponent implements OnInit {
    public user = input.required<User>();
    public relationship = input.required<Relationship>();
    public singleButton = input(false);
    public relationChanged = output<Relationship>();

    protected updatedRelationship = computed(() => this.relationshipAfterAction() || this.relationship());
    protected updatedUser = computed(() => this.userAfterAction() || this.user());

    protected isDuringRelationshipAction = signal(false);
    protected showFollowButton = signal(false);
    protected showUnfollowButton = signal(false);
    protected showApproveFollowButton = signal(false);
    protected showOpenOriginalProfileButton = signal(false);
    protected showMuteButton = signal(false);
    protected showUnmuteButton = signal(false);
    protected showFeatureButton = signal(false);
    protected showUnfeatureButton = signal(false);
    protected showReportButton = signal(false);

    private signedInUser?: User;
    private relationshipAfterAction = signal<Relationship | undefined>(undefined);
    private userAfterAction = signal<User | undefined>(undefined);

    constructor(
        private usersService: UsersService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private followRequestsService: FollowRequestsService,
        private reportsService: ReportsService,
        private windowService: WindowService,
        private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.signedInUser = this.authorizationService.getUser();
        this.recalculateRelationship();
    }

    onOriginalProfile(): void {
        const internalUser = this.user();

        if (internalUser.activityPubProfile) {
            this.windowService.openPage(internalUser.url ?? internalUser.activityPubProfile);
        }
    }

    openMuteAccountDialog(): void {
        const dialogRef = this.dialog.open(MuteAccountDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const internalUser = this.user();

                    if (internalUser.userName) {
                        const downloadedRelationship = await this.usersService.mute(internalUser.userName, result);
                        this.relationshipAfterAction.set(downloadedRelationship)
                        this.recalculateRelationship();

                        this.relationChanged.emit(this.updatedRelationship());
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
            const internalUser = this.user();

            if (internalUser.userName) {
                const downloadedRelationship = await this.usersService.unmute(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
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
            data: new ReportData(this.user(), undefined)
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
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.usersService.follow(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);

                this.recalculateRelationship();
                this.relationChanged.emit(this.updatedRelationship());
                
                if (this.updatedRelationship().following) {
                    this.messageService.showSuccess('You are following the user.');
                } else {
                    this.messageService.showSuccess('The follow request has been sent.');
                }
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    async onUnfollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.usersService.unfollow(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
                this.messageService.showSuccess('You have unfollowed the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    async onApproveFollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.id && internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.followRequestsService.approve(internalUser.id);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
                this.messageService.showSuccess('You have accepted the user\'s follow request.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    async onRejectFollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.id && internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.followRequestsService.reject(internalUser.id);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
                this.messageService.showSuccess('You have declined the user\'s follow request');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    async onFeature(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                const downloadedUser = await this.usersService.feature(internalUser.userName);
                this.userAfterAction.set(downloadedUser);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
                this.messageService.showSuccess('You have featured the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    async onUnfeature(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                const downloadedUser = await this.usersService.unfeature(internalUser.userName);
                this.userAfterAction.set(downloadedUser);
                this.recalculateRelationship();

                this.relationChanged.emit(this.updatedRelationship());
                this.messageService.showSuccess('You have removed the user from featured.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    private shouldShowFollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        if (this.updatedRelationship().following === true) {
            return false;
        }

        if (this.updatedRelationship().requested === true) {
            return false;
        }

        return true;
    }

    private shouldShowUnfollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        if ((this.updatedRelationship().following ?? false) === false && (this.updatedRelationship().requested ?? false) == false) {
            return false;
        }

        return true;
    }

    private shouldShowApproveFollowButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        if ((this.updatedRelationship().requestedBy ?? false) === false) {
            return false;
        }

        return true;
    }

    private shouldShowOpenOriginalProfileButton(): boolean {
        if (this.signedInUser?.id === this.updatedUser().id) {
            return false;
        }

        if (this.updatedUser().activityPubProfile?.startsWith(this.windowService.apiUrl())) {
            return false;
        }

        return true;
    }

    private shouldShowMuteButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        const isMuted = this.updatedRelationship().mutedStatuses ||  this.updatedRelationship().mutedReblogs || this.updatedRelationship().mutedNotifications;
        return isMuted === null || isMuted === false;
    }

    private shouldShowUnmuteButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        const isMuted = this.updatedRelationship().mutedStatuses ||  this.updatedRelationship().mutedReblogs || this.updatedRelationship().mutedNotifications;
        return isMuted === true;
    }

    private shouldShowFeatureButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        if (!this.authorizationService.hasRole(Role.Moderator) && !this.authorizationService.hasRole(Role.Administrator)) {
            return false;
        }

        return this.updatedUser().featured === false;
    }

    private shouldShowUnfeatureButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        if (!this.authorizationService.hasRole(Role.Moderator) && !this.authorizationService.hasRole(Role.Administrator)) {
            return false;
        }

        return this.updatedUser().featured === true;
    }

    private shouldShowReportButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        return true;
    }

    private recalculateRelationship(): void {
        this.showFollowButton.set(this.shouldShowFollowButton());
        this.showUnfollowButton.set(this.shouldShowUnfollowButton());
        this.showApproveFollowButton.set(this.shouldShowApproveFollowButton());
        this.showOpenOriginalProfileButton.set(this.shouldShowOpenOriginalProfileButton());
        this.showMuteButton.set(this.shouldShowMuteButton());
        this.showUnmuteButton.set(this.shouldShowUnmuteButton());
        this.showFeatureButton.set(this.shouldShowFeatureButton());
        this.showUnfeatureButton.set(this.shouldShowUnfeatureButton());
        this.showReportButton.set(this.shouldShowReportButton());
    }
}
