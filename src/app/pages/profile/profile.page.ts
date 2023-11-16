import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { PageNotFoundError } from 'src/app/errors/page-not-found-error';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ProfilePageTab } from 'src/app/models/profile-page-tab';
import { LoadingService } from 'src/app/services/common/loading.service';
import { LinkableResult } from 'src/app/models/linkable-result';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage implements OnInit, OnDestroy {
    readonly ProfilePageTab = ProfilePageTab;

    isReady = false;
    allFollowingDisplayed = false;
    allFollowersDisplayed = false;
    loadingDifferentFrofile = false;
    profilePageTab = ProfilePageTab.Statuses;
    userName!: string;

    signedInUser?: User;
    user?: User;

    relationship?: Relationship;
    followersRelationships?: Relationship[] = [];
    followingRelationships?: Relationship[] = [];
    
    following?: LinkableResult<User>;
    followers?: LinkableResult<User>;
    latestFollowers?: LinkableResult<User>;
    statuses?: LinkableResult<Status>;

    routeParamsSubscription?: Subscription;
    routeNavigationEndSubscription?: Subscription;
    routeNavigationStartSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private relationshipsService: RelationshipsService,
        private loadingService: LoadingService,
        private router: Router,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {
        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;
                if (navigationStarEvent.url.includes(this.userName) ) {
                    this.loadingDifferentFrofile = false;
                } else {
                    this.loadingDifferentFrofile = true;
                }
            });

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                if (!this.loadingDifferentFrofile) {
                    const navigationEndEvent  = event as NavigationEnd;
        
                    if (navigationEndEvent.url.includes('/following')) {
                        this.profilePageTab = ProfilePageTab.Following;
                        if (!this.following) {
                            await this.onLoadMoreFollowing();
                        }
                    } else if (navigationEndEvent.url.includes('/followers')) {
                        this.profilePageTab = ProfilePageTab.Followers;
                        if (!this.followers) {
                            await this.onLoadMoreFollowers();
                        }
                    } else {
                        this.profilePageTab = ProfilePageTab.Statuses;
                        if (!this.statuses) {
                            this.statuses = await this.usersService.statuses(this.userName);
                        }
                    }
                }
            });

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady = false;
            this.loadingService.showLoader();

            const userName = params['userName'] as string;
            if (!userName.startsWith('@')) {
                throw new PageNotFoundError();
            }

            this.userName = userName;
            this.followers = undefined;
            this.following = undefined;
            this.statuses = undefined;

            this.signedInUser = this.authorizationService.getUser();

            [this.user, this.latestFollowers] = await Promise.all([
                this.usersService.profile(userName),
                this.usersService.followers(userName, undefined, undefined, undefined, 10)
            ]);

            this.relationship = await this.downloadRelationship();
            await this.loadPageData();

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
        this.routeNavigationStartSubscription?.unsubscribe()
    }

    async onMainRelationChanged(): Promise<void> {
        this.user = await this.usersService.profile(this.userName);
        if (this.profilePageTab === ProfilePageTab.Followers) {
            const internalFollowers = await this.usersService.followers(this.userName);

            if ((internalFollowers.data?.length ?? 0) !== 0) {
                this.followersRelationships = await this.relationshipsService.getAll(internalFollowers.data.map(x => x.id ?? ''))
            }

            this.followers = internalFollowers;
        }
    }

    async onRelationChanged(relationship: Relationship): Promise<void> {
        this.user = await this.usersService.profile(this.userName);

        const index = this.following?.data.findIndex(x => x.id === relationship.userId) ?? -1;
        if (index > -1) {
            this.following?.data.splice(index, 1);
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

    async onLoadMoreFollowing(): Promise<void> {
        const internalFollowing = await this.usersService.following(this.userName, undefined, this.following?.maxId, undefined, undefined);

        if (this.signedInUser && (internalFollowing.data?.length ?? 0) !== 0) {
            const internalFollowingRelationships = await this.relationshipsService.getAll(internalFollowing.data.map(x => x.id ?? ''));
            this.followingRelationships?.push(...internalFollowingRelationships);
        }

        if (this.following) {
            if (internalFollowing.data.length > 0) {
                this.following.data.push(...internalFollowing.data);
                this.following.minId = internalFollowing.minId;
                this.following.maxId = internalFollowing.maxId;
            } else {
                this.allFollowingDisplayed = true;
            }
        } else {
            this.following = internalFollowing;

            if (this.following.data.length === 0) {
                this.allFollowingDisplayed = true;
            }
        }
    }

    async onLoadMoreFollowers(): Promise<void> {
        const internalFollowers = await this.usersService.followers(this.userName, undefined, this.followers?.maxId, undefined, undefined);

        if (this.signedInUser && (internalFollowers.data?.length ?? 0) !== 0) {
            const internalFollowersRelationships = await this.relationshipsService.getAll(internalFollowers.data.map(x => x.id ?? ''));
            this.followersRelationships?.push(...internalFollowersRelationships);
        }

        if (this.followers) {
            if (internalFollowers.data.length > 0) {
                this.followers.data.push(...internalFollowers.data);
                this.followers.minId = internalFollowers.minId;
                this.followers.maxId = internalFollowers.maxId;
            } else {
                this.allFollowersDisplayed = true;
            }
        } else {
            this.followers = internalFollowers;

            if (this.followers.data.length === 0) {
                this.allFollowersDisplayed = true;
            }
        }
    }

    private async loadPageData(): Promise<void> {
        const currentUrl = this.router.routerState.snapshot.url;
        
        if (currentUrl.includes('/following')) {
            this.profilePageTab = ProfilePageTab.Following;
            await this.onLoadMoreFollowing();
        } else if (currentUrl.includes('/followers')) {
            this.profilePageTab = ProfilePageTab.Followers;
            await this.onLoadMoreFollowers();
        } else {
            this.profilePageTab = ProfilePageTab.Statuses;
            this.statuses = await this.usersService.statuses(this.userName);
        }
    }
}
