import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
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
import { Responsive } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { WindowService } from 'src/app/services/common/window.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileCodeDialog } from 'src/app/dialogs/profile-code-dialog/profile-code.dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage extends Responsive implements OnInit, OnDestroy {
    readonly ProfilePageTab = ProfilePageTab;

    isReady = false;
    allFollowingDisplayed = false;
    allFollowersDisplayed = false;
    loadingDifferentProfile = false;
    squareImages = false;
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
        @Inject(DOCUMENT) private document: Document,
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private relationshipsService: RelationshipsService,
        private loadingService: LoadingService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private metaService: Meta,
        private windowService: WindowService,
        private preferencesService: PreferencesService,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.squareImages = this.preferencesService.isSquareImages;

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))  
            .subscribe(async (event) => {
                const navigationStarEvent = event as NavigationStart;
                if (navigationStarEvent.url.includes(this.userName.substring(1))) {
                    this.loadingDifferentProfile = false;
                } else {
                    this.loadingDifferentProfile = true;
                }
            });

        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                if (!this.loadingDifferentProfile) {
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

            let userNameFromParams = params['userName'] as string;
            if (!userNameFromParams.startsWith('@')) {
                userNameFromParams = `@${userNameFromParams}`
            }

            this.userName = userNameFromParams;
            this.followers = undefined;
            this.following = undefined;
            this.statuses = undefined;

            this.signedInUser = this.authorizationService.getUser();

            this.user = await this.usersService.profile(this.userName);
            this.latestFollowers = await this.usersService.followers(this.userName, undefined, undefined, undefined, 10)

            this.user.fields?.forEach(field => {
                if (field.value) {
                    const loweCasedValue = field.value.toLowerCase();
                    if (loweCasedValue.startsWith('https://')) {
                        this.createLink(loweCasedValue);
                    }
                }
            });

            this.relationship = await this.downloadRelationship();
            await this.loadPageData();
            this.setCardMetatags();

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

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

    onAvatarClick(): void {
        this.dialog.open(ProfileCodeDialog, {
            data: this.user?.userName
        });
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

    private createLink(url: string): void {
        let link: HTMLLinkElement = this.document.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'me');

        this.document.head.appendChild(link);
    }

    private setCardMetatags(): void {
        const profileTitle = (this.user?.name ?? '') + ` (@${this.user?.userName ?? ''})`;
        const profileDescription = this.htmlToText(this.user?.bio ?? '');

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(profileTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: profileDescription });

        // <meta property="og:url" content="https://vernissage.xxx/@user/112348668082695358">
        this.metaService.updateTag({ property: 'og:url', content: this.windowService.getApplicationUrl() });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: profileTitle });

        // <meta property="og:description" content="Somethinf apps next?">
        this.metaService.updateTag({ property: 'og:description', content: profileDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `https://${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        const avatarImage = this.user?.avatarUrl;
        if (avatarImage) {
            const firstImage = this.user?.avatarUrl;

            // <meta property="og:image" content="https://files.vernissage.xxx/media_attachments/files/112348.png">
            this.metaService.updateTag({ property: 'og:image', content: avatarImage });

            // <meta property="og:image:width"" content="1532">
            this.metaService.updateTag({ property: 'og:image:width', content: '600' });

            // <meta property="og:image:height"" content="1416">
            this.metaService.updateTag({ property: 'og:image:height', content: '600' });
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
