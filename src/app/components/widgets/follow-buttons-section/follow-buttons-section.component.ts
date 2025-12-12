import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
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
import { RelationshipsService } from 'src/app/services/http/relationships.service';

@Component({
    selector: 'app-follow-buttons-section',
    templateUrl: './follow-buttons-section.component.html',
    styleUrls: ['./follow-buttons-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FollowButtonsSectionComponent implements OnInit, OnDestroy {
    public user = input.required<User>();
    public relationship = input.required<Relationship>();
    public singleButton = input(false);
    public relationChanged = output<Relationship>();

    protected updatedRelationship = computed(() => this.relationshipAfterAction() || this.relationship());
    protected updatedUser = computed(() => this.userAfterAction() || this.user());

    protected isDuringRelationshipAction = signal(false);
    protected showFollowButton = signal(false);
    protected showChangeRelationshipButton = signal(false);
    protected showApproveFollowButton = signal(false);
    protected showOpenOriginalProfileButton = signal(false);
    protected showCopyProfileUrlButton = signal(false);
    protected showMuteButton = signal(false);
    protected showUnmuteButton = signal(false);
    protected showFeatureButton = signal(false);
    protected showUnfeatureButton = signal(false);
    protected showReportButton = signal(false);

    private signedInUser?: User;
    private relationshipAfterAction = signal<Relationship | undefined>(undefined);
    private userAfterAction = signal<User | undefined>(undefined);

    private relationshipRefreshInterval: NodeJS.Timeout | undefined;
    private relationshipRefreshCounter = 0;
    private readonly relationshipRefreshTime = 2500;
    private readonly relationshipRefreshMaxCounter = 10;

    private usersService = inject(UsersService);
    private messageService = inject(MessagesService);
    private authorizationService = inject(AuthorizationService);
    private followRequestsService = inject(FollowRequestsService);
    private reportsService = inject(ReportsService);
    private windowService = inject(WindowService);
    private messagesService = inject(MessagesService);
    private relationshipsService = inject(RelationshipsService);
    private dialog = inject(MatDialog);
    private clipboard = inject(Clipboard);

    constructor() {
        effect(() => {
            // After changing relationship from parent we have to rebuild the components.
            const newRelationships = this.updatedRelationship();
            this.relationshipAfterAction.set(newRelationships);

            this.recalculateRelationship();
        });
    }

    ngOnInit(): void {
        this.signedInUser = this.authorizationService.getUser();
        this.recalculateRelationship();
    }

    ngOnDestroy(): void {
        if (this.relationshipRefreshInterval) {
            clearInterval(this.relationshipRefreshInterval);
        }
    }

    onOriginalProfile(): void {
        const internalUser = this.user();

        if (internalUser.activityPubProfile) {
            this.windowService.openPage(internalUser.url ?? internalUser.activityPubProfile);
        }
    }

    protected onCopyLinkToPost(): void {
        this.clipboard.copy(this.updatedUser().url ?? '');
    }

    protected openMuteAccountDialog(): void {
        const dialogRef = this.dialog.open(MuteAccountDialog, {
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const internalUser = this.user();

                    if (internalUser.userName) {
                        const downloadedRelationship = await this.usersService.mute(internalUser.userName, result);
                        this.relationshipAfterAction.set(downloadedRelationship);
                        this.recalculateRelationship();

                        this.emitRelationChange();
                        this.messageService.showSuccess('Mute has been saved.');
                    }
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected toggleChange(event: MatButtonToggleChange) {
        event.source.buttonToggleGroup.value = '';
    }

    protected async unmuteAccount(): Promise<void> {
        try {
            const internalUser = this.user();

            if (internalUser.userName) {
                const downloadedRelationship = await this.usersService.unmute(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('Mute has been canceled.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    protected async onReportDialog(): Promise<void> {
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

    protected async onFollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.usersService.follow(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);

                this.recalculateRelationship();
                this.emitRelationChange();
                
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

    protected async onUnfollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.usersService.unfollow(internalUser.userName);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('You have unfollowed the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    protected async onApproveFollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.id && internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.followRequestsService.approve(internalUser.id);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('You have accepted the user\'s follow request.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    protected async onRejectFollow(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.id && internalUser.userName) {
            try {
                this.isDuringRelationshipAction.set(true);
                const downloadedRelationship = await this.followRequestsService.reject(internalUser.id);
                this.relationshipAfterAction.set(downloadedRelationship);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('You have declined the user\'s follow request');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction.set(false);
            }
        }
    }

    protected async onFeature(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                const downloadedUser = await this.usersService.feature(internalUser.userName);
                this.userAfterAction.set(downloadedUser);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('You have featured the user.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    protected async onUnfeature(): Promise<void> {
        const internalUser = this.user();

        if (internalUser.userName) {
            try {
                const downloadedUser = await this.usersService.unfeature(internalUser.userName);
                this.userAfterAction.set(downloadedUser);
                this.recalculateRelationship();

                this.emitRelationChange();
                this.messageService.showSuccess('You have removed the user from featured.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            }
        }
    }

    private shouldShowChangeRelationshipButton(): boolean {
        if (!this.signedInUser) {
            return false;
        }

        if (this.signedInUser.id === this.updatedUser().id) {
            return false;
        }

        return true;
    }

    private shouldShowFollowButton(): boolean {
        if (this.updatedRelationship().following === true) {
            return false;
        }

        if (this.updatedRelationship().requested === true) {
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

    private shouldShowCopyProfileUrlButton(): boolean {
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
        this.showChangeRelationshipButton.set(this.shouldShowChangeRelationshipButton());
        this.showFollowButton.set(this.shouldShowFollowButton());
        this.showApproveFollowButton.set(this.shouldShowApproveFollowButton());
        this.showOpenOriginalProfileButton.set(this.shouldShowOpenOriginalProfileButton());
        this.showCopyProfileUrlButton.set(this.shouldShowCopyProfileUrlButton());
        this.showMuteButton.set(this.shouldShowMuteButton());
        this.showUnmuteButton.set(this.shouldShowUnmuteButton());
        this.showFeatureButton.set(this.shouldShowFeatureButton());
        this.showUnfeatureButton.set(this.shouldShowUnfeatureButton());
        this.showReportButton.set(this.shouldShowReportButton());
    }

    private emitRelationChange(): void {
        this.relationChanged.emit(this.updatedRelationship());

        // When we send follow request, we can refresh the relationship object automatically.
        if (this.updatedRelationship().following === false && this.updatedRelationship().requested === true) {
            if (this.relationshipRefreshInterval) {
                clearInterval(this.relationshipRefreshInterval);
            }

            this.relationshipRefreshInterval = setInterval(async () => {
                const downloadedRelationships = await this.downloadRelationship();
                this.relationshipAfterAction.set(downloadedRelationships);
                this.relationshipRefreshCounter = this.relationshipRefreshCounter  + 1;

                if (this.relationship()?.following === true) {
                    this.messagesService.showSuccess('Your follow request has been accepted.');
                }

                // When we try 10 times or request is approved we should cancel.
                if (this.relationship()?.following === true || this.relationshipRefreshCounter >= this.relationshipRefreshMaxCounter) {
                    if (this.relationshipRefreshInterval) {
                        clearInterval(this.relationshipRefreshInterval);
                    }
                }
            }, this.relationshipRefreshTime);
        }
    }

    private async downloadRelationship(): Promise<Relationship | undefined> {
        const signedInUser = this.authorizationService.getUser();
        if (!signedInUser) {
            return undefined;
        }

        const internalUser = this.user();
        if (signedInUser.id === internalUser?.id) {
            return undefined;
        }

        if (!internalUser || !internalUser.id) {
            return undefined;
        }

        return await this.relationshipsService.get(internalUser.id);
    }
}
