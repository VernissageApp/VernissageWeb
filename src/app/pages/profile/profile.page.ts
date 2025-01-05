import { Component, Inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { WindowService } from 'src/app/services/common/window.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileCodeDialog } from 'src/app/dialogs/profile-code-dialog/profile-code.dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { MessagesService } from 'src/app/services/common/messages.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class ProfilePage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly profilePageTab = ProfilePageTab;
    protected isReady = signal(false);

    protected allFollowingDisplayed = signal(false);
    protected allFollowersDisplayed = signal(false);
    protected squareImages = signal(false);
    protected selectedProfilePageTab = signal(ProfilePageTab.Statuses);
    protected createdAt = signal<Date | undefined>(undefined);
    protected signedInUser = signal<User | undefined>(undefined);
    protected user = signal<User | undefined>(undefined);
    protected relationship = signal<Relationship | undefined>(undefined);

    protected followersRelationships = signal<Relationship[]>([]);
    protected followingRelationships = signal<Relationship[]>([]);
    
    protected following = signal<LinkableResult<User> | undefined>(undefined);
    protected followers = signal<LinkableResult<User> | undefined>(undefined);

    protected latestFollowers = signal<LinkableResult<User> | undefined>(undefined);
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);

    private routeParamsSubscription?: Subscription;
    private routeNavigationEndSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;

    private userName!: string;
    private loadingDifferentProfile = false;
    private relationshipRefreshInterval: NodeJS.Timeout | undefined;
    private relationshipRefreshCounter = 0;

    private readonly relationshipRefreshTime = 2500;
    private readonly relationshipRefreshMaxCounter = 10;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private relationshipsService: RelationshipsService,
        private loadingService: LoadingService,
        private messagesService: MessagesService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private metaService: Meta,
        private windowService: WindowService,
        private preferencesService: PreferencesService,
        protected userDisplayService: UserDisplayService,
        public dialog: MatDialog,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.squareImages.set(this.preferencesService.isSquareImages);

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
                        this.selectedProfilePageTab.set(ProfilePageTab.Following);
                        if (!this.following()) {
                            await this.onLoadMoreFollowing();
                        }
                    } else if (navigationEndEvent.url.includes('/followers')) {
                        this.selectedProfilePageTab.set(ProfilePageTab.Followers);
                        if (!this.followers()) {
                            await this.onLoadMoreFollowers();
                        }
                    } else {
                        this.selectedProfilePageTab.set(ProfilePageTab.Statuses);
                        if (!this.statuses()) {
                            const downloadedStatuses = await this.usersService.statuses(this.userName);
                            this.statuses.set(downloadedStatuses);
                        }
                    }
                }
            });

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            this.isReady.set(false);
            this.loadingService.showLoader();

            let userNameFromParams = params['userName'] as string;
            if (!userNameFromParams.startsWith('@')) {
                userNameFromParams = `@${userNameFromParams}`
            }

            this.userName = userNameFromParams;
            this.followers.set(undefined);
            this.following.set(undefined);
            this.statuses.set(undefined);

            this.signedInUser.set(this.authorizationService.getUser());

            const downloadUser = await this.usersService.profile(this.userName);
            this.user.set(downloadUser);

            this.createdAt.set(new Date(downloadUser.createdAt));

            const downloadedLatestFollowers = await this.usersService.followers(this.userName, undefined, undefined, undefined, 10);
            this.latestFollowers.set(downloadedLatestFollowers);

            downloadUser.fields?.forEach(field => {
                if (field.value) {
                    const loweCasedValue = field.value.toLowerCase();
                    if (loweCasedValue.startsWith('https://')) {
                        this.createLink(loweCasedValue);
                    }
                }
            });

            const downloadedRelationships = await this.downloadRelationship();
            this.relationship.set(downloadedRelationships);

            await this.loadPageData();
            this.setCardMetatags();

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationEndSubscription?.unsubscribe();
        this.routeNavigationStartSubscription?.unsubscribe()

        if (this.relationshipRefreshInterval) {
            clearInterval(this.relationshipRefreshInterval);
        }
    }

    async onMainRelationChanged(relationship: Relationship): Promise<void> {
        const downloadUser = await this.usersService.profile(this.userName);
        this.user.set(downloadUser);

        if (this.selectedProfilePageTab() === ProfilePageTab.Followers) {
            const internalFollowers = await this.usersService.followers(this.userName);

            if ((internalFollowers.data?.length ?? 0) !== 0) {
                const downloadedRelationships = await this.relationshipsService.getAll(internalFollowers.data.map(x => x.id ?? ''));
                this.followersRelationships.set(downloadedRelationships);
            }

            this.followers.set(internalFollowers);
        }

        // When we send follow request, we can refresh the relationship object automatically.
        if (relationship.following === false && relationship.requested === true) {
            if (this.relationshipRefreshInterval) {
                clearInterval(this.relationshipRefreshInterval);
            }

            this.relationshipRefreshInterval = setInterval(async () => {
                const downloadedRelationships = await this.downloadRelationship();
                this.relationship.set(downloadedRelationships);
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

    async onRelationChanged(relationship: Relationship): Promise<void> {
        const downloadUser = await this.usersService.profile(this.userName);
        this.user.set(downloadUser);

        const index = this.following()?.data.findIndex(x => x.id === relationship.userId) ?? -1;
        if (index > -1) {
            this.following.update((value) => {
                value?.data.splice(index, 1);
                return value;
            });
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

    async onLoadMoreFollowing(): Promise<void> {
        const internalFollowing = await this.usersService.following(this.userName, undefined, this.following()?.maxId, undefined, undefined);

        if (this.signedInUser() && (internalFollowing.data?.length ?? 0) !== 0) {
            const internalFollowingRelationships = await this.relationshipsService.getAll(internalFollowing.data.map(x => x.id ?? ''));
            this.followingRelationships.update((relationships) => {
                relationships.push(...internalFollowingRelationships);
                return relationships;
            });
        }

        if (this.following()) {
            if (internalFollowing.data.length > 0) {
                this.following.update((value) => {
                    if (value) {
                        value.data.push(...internalFollowing.data);
                        value.minId = internalFollowing.minId;
                        value.maxId = internalFollowing.maxId;
                    }

                    return value;
                });


            } else {
                this.allFollowingDisplayed.set(true);
            }
        } else {
            this.following.set(internalFollowing);

            if (this.following()?.data.length === 0) {
                this.allFollowingDisplayed.set(true);
            }
        }
    }

    async onLoadMoreFollowers(): Promise<void> {
        const internalFollowers = await this.usersService.followers(this.userName, undefined, this.followers()?.maxId, undefined, undefined);

        if (this.signedInUser() && (internalFollowers.data?.length ?? 0) !== 0) {
            const internalFollowersRelationships = await this.relationshipsService.getAll(internalFollowers.data.map(x => x.id ?? ''));
            this.followersRelationships.update((relationships) => {
                relationships?.push(...internalFollowersRelationships);
                return relationships;
            });
        }

        if (this.followers()) {
            if (internalFollowers.data.length > 0) {
                this.followers.update((value) => {
                    if (value) {
                        value.data.push(...internalFollowers.data);
                        value.minId = internalFollowers.minId;
                        value.maxId = internalFollowers.maxId;
                    }

                    return value;
                });

            } else {
                this.allFollowersDisplayed.set(true);
            }
        } else {
            this.followers.set(internalFollowers);

            if (this.followers()?.data.length === 0) {
                this.allFollowersDisplayed.set(true);
            }
        }
    }

    onAvatarClick(): void {
        this.dialog.open(ProfileCodeDialog, {
            data: this.user()?.userName
        });
    }

    private async loadPageData(): Promise<void> {
        const currentUrl = this.router.routerState.snapshot.url;
        
        if (currentUrl.includes('/following')) {
            this.selectedProfilePageTab.set(ProfilePageTab.Following);
            await this.onLoadMoreFollowing();
        } else if (currentUrl.includes('/followers')) {
            this.selectedProfilePageTab.set(ProfilePageTab.Followers);
            await this.onLoadMoreFollowers();
        } else {
            this.selectedProfilePageTab.set(ProfilePageTab.Statuses);

            const statuses = await this.usersService.statuses(this.userName);
            statuses.context = ContextTimeline.user;
            statuses.user = this.user()?.userName;

            this.statuses.set(statuses);
        }
    }

    private createLink(url: string): void {
        const link: HTMLLinkElement = this.document.createElement('link');
        link.setAttribute('href', url);
        link.setAttribute('rel', 'me');

        this.document.head.appendChild(link);
    }

    private setCardMetatags(): void {
        const profileTitle = (this.user?.name ?? '') + ` (@${this.user()?.userName ?? ''})`;
        const profileDescription = this.htmlToText(this.user()?.bio ?? '');

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

        const avatarImage = this.user()?.avatarUrl;
        if (avatarImage) {
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
