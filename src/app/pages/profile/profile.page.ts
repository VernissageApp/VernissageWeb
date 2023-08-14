import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ProfilePageTab } from 'src/app/models/profile-page-tab';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage implements OnInit, OnDestroy {
    readonly ProfilePageTab = ProfilePageTab;

    isReady = false;
    profilePageTab = ProfilePageTab.Statuses;
    userName!: string;

    user?: User;
    relationship?: Relationship;
    latestFollowers?: User[];

    followers?: User[];
    followersRelationships?: Relationship[];
    following?: User[];
    followingRelationships?: Relationship[];
    
    statuses?: Status[];

    routeParamsSubscription?: Subscription;
    routeUrlSubscription?: Subscription;

    headerUrl = '/assets/header.jpg';
    avatarUrl = '/assets/avatar.png';

    gallery?: Status[][];
    readonly columns = 3;

    constructor(
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private statusesService: StatusesService,
        private relationshipsService: RelationshipsService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {

        this.routeUrlSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async () => {
                await this.loadPageData();
            });

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady = false;

            const userName = params['userName'] as string;
            if (!userName.startsWith('@')) {
                throw new PageNotFoundError();
            }

            this.userName = userName;
            this.followers = [];
            this.following = [];

            this.user = await this.usersService.profile(userName);
            this.relationship = await this.downloadRelationship();
            this.latestFollowers = await this.usersService.followers(userName, 0, 20);

            this.headerUrl = this.user.headerUrl ?? '/assets/header.jpg';
            this.avatarUrl = this.user.avatarUrl ?? '/assets/avatar.png';

            await this.loadPageData();

            this.isReady = true;
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
        this.routeUrlSubscription?.unsubscribe();
    }

    async onMainRelationChanged(): Promise<void> {
        this.user = await this.usersService.profile(this.userName);
        if (this.profilePageTab === ProfilePageTab.Followers) {
            const internalFollowers = await this.usersService.followers(this.userName);
            if ((internalFollowers?.length ?? 0) !== 0) {
                this.followersRelationships = await this.relationshipsService.getAll(internalFollowers.map(x => x.id ?? ''))
            }

            this.followers = internalFollowers;
        }
    }

    async onRelationChanged(): Promise<void> {
        this.user = await this.usersService.profile(this.userName);
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

    private async loadPageData(): Promise<void> {
        const currentUrl = this.router.routerState.snapshot.url;
        if (currentUrl.includes('/following')) {
            this.profilePageTab = ProfilePageTab.Following;
            const internalFollowing = await this.usersService.following(this.userName);

            if ((internalFollowing?.length ?? 0) !== 0) {
                this.followingRelationships = await this.relationshipsService.getAll(internalFollowing.map(x => x.id ?? ''))
            }

            this.following = internalFollowing;
        } else if (currentUrl.includes('/followers')) {
            this.profilePageTab = ProfilePageTab.Followers;
            const internalFollowers = await this.usersService.followers(this.userName);

            if ((internalFollowers?.length ?? 0) !== 0) {
                this.followersRelationships = await this.relationshipsService.getAll(internalFollowers.map(x => x.id ?? ''))
            }

            this.followers = internalFollowers;
        } else {
            this.profilePageTab = ProfilePageTab.Statuses;
            this.statuses = await this.statusesService.get();
            this.buildGallery();
        }
    }
}
