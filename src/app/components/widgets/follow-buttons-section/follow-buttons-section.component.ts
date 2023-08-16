import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { FollowRequestsService } from 'src/app/services/http/follow-requests.service';
import { UsersService } from 'src/app/services/http/users.service';
import { environment } from 'src/environments/environment';

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
    showFollowButton = false;
    showUnfollowButton = false;
    showApproveFollowButton = false;
    showOpenOriginalProfileButton = false;

    constructor(
        private usersService: UsersService,
        private messageService: MessagesService,
        private authorizationService: AuthorizationService,
        private followRequestsService: FollowRequestsService,
        private changeDetectorRef: ChangeDetectorRef) {
    }
    ngOnInit(): void {
        this.recalculateRelationship();
    }

    onOriginalProfile(): void {
        if (this.user?.activityPubProfile) {
            window.open(this.user.activityPubProfile, "_blank");
        }
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
        const signedInUser = this.authorizationService.getUser();
        if (!signedInUser) {
            return false;
        }

        if (signedInUser.id === this.user?.id) {
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
        const signedInUser = this.authorizationService.getUser();
        if (!signedInUser) {
            return false;
        }

        if (signedInUser.id === this.user?.id) {
            return false;
        }

        if ((this.relationship?.following ?? false) === false && (this.relationship?.requested ?? false) == false) {
            return false;
        }

        return true;
    }

    private shouldShowApproveFollowButton(): boolean {
        const signedInUser = this.authorizationService.getUser();
        if (!signedInUser) {
            return false;
        }

        if (signedInUser.id === this.user?.id) {
            return false;
        }

        if ((this.relationship?.requestedBy ?? false) === false) {
            return false;
        }

        return true;
    }

    private shouldShowOpenOriginalProfileButton(): boolean {
        const signedInUser = this.authorizationService.getUser();
        if (signedInUser?.id === this.user?.id) {
            return false;
        }

        if (this.user?.activityPubProfile?.startsWith(environment.httpSchema + environment.apiService)) {
            return false;
        }

        return true;
    }

    private recalculateRelationship(): void {
        this.showFollowButton = this.shouldShowFollowButton();
        this.showUnfollowButton = this.shouldShowUnfollowButton();
        this.showApproveFollowButton = this.shouldShowApproveFollowButton();
        this.showOpenOriginalProfileButton = this.shouldShowOpenOriginalProfileButton();
    }
}
