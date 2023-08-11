import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { MessagesService } from 'src/app/services/common/messages.service';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { FollowRequestsService } from 'src/app/services/http/follow-requests.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage implements OnInit, OnDestroy {
    user?: User;
    relationship?: Relationship;
    statuses?: Status[];
    routeParamsSubscription?: Subscription;

    isDuringRelationshipAction = false;
    showFollowButton = false;
    showUnfollowButton = false;
    showApproveFollowButton = false;

    headerUrl = '/assets/header.jpg';
    avatarUrl = '/assets/avatar.png';

    gallery?: Status[][];
    readonly columns = 3;

    constructor(
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private statusesService: StatusesService,
        private relationshipsService: RelationshipsService,
        private followRequestsService: FollowRequestsService,
        private messageService: MessagesService,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {
        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            const userName = params['userName'] as string;

            if (!userName.startsWith('@')) {
                throw new PageNotFoundError();
            }

            this.user = await this.usersService.profile(userName);
            this.statuses = await this.statusesService.get();
            this.relationship = await this.downloadRelationship();
            this.buildGallery();

            this.headerUrl = this.user.headerUrl ?? '/assets/header.jpg';
            this.avatarUrl = this.user.avatarUrl ?? '/assets/avatar.png';

            this.recalculateRelationship();
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    getMainAttachmentSrc(status: Status): string {
        if (!status.attachments) {
            return '';
        }

        if (status.attachments?.length === 0) {
            return '';
        }

        return status.attachments[0].smallFile?.url ?? '';
    }

    async onFollow(): Promise<void> {
        if (this.user?.userName) {
            try {
                this.isDuringRelationshipAction = true;
                this.relationship = await this.usersService.follow(this.user?.userName);
                this.user = await this.usersService.profile(this.user?.userName);
                this.recalculateRelationship();

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
                this.user = await this.usersService.profile(this.user?.userName);
                this.recalculateRelationship();

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
                this.user = await this.usersService.profile(this.user?.userName);
                this.recalculateRelationship();

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
                this.user = await this.usersService.profile(this.user?.userName);
                this.recalculateRelationship();

                this.messageService.showSuccess('User is now following you.');
            } catch (error) {
                console.error(error);
                this.messageService.showServerError(error);
            } finally {
                this.isDuringRelationshipAction = false;
            }
        }
    }

    private buildGallery(): void {
        this.gallery = [];

        for(let i = 0; i < this.columns; i++) {
            this.gallery?.push([]);
        }

        if (!this.statuses) {
            return;
        }

        let currentColumn = 0;
        for (let status of this.statuses) {
            this.gallery[currentColumn].push(status);
            currentColumn = (currentColumn + 1) % this.columns;
        }

        console.log(this.gallery);
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

    private async downloadRelationship(): Promise<Relationship | undefined> {
        const signedInUser = this.authorizationService.getUser();
        if (!signedInUser) {
            return undefined;
        }

        if (signedInUser.id === this.user?.id) {
            return undefined;
        }

        if (!this.user || !this.user.id) {
            return undefined;
        }

        return await this.relationshipsService.get(this.user.id);
    }

    private recalculateRelationship(): void {
        this.showFollowButton = this.shouldShowFollowButton();
        this.showUnfollowButton = this.shouldShowUnfollowButton();
        this.showApproveFollowButton = this.shouldShowApproveFollowButton();
    }
}
