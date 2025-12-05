import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, DOCUMENT } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UsersService } from 'src/app/services/http/users.service';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ProfilePageTab } from 'src/app/models/profile-page-tab';
import { LoadingService } from 'src/app/services/common/loading.service';
import { LinkableResult } from 'src/app/models/linkable-result';

import { Meta, Title } from '@angular/platform-browser';
import { WindowService } from 'src/app/services/common/window.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileCodeDialog } from 'src/app/dialogs/profile-code-dialog/profile-code.dialog';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';
import { ShareBusinessCardDialog } from 'src/app/dialogs/share-business-card-dialog/share-business-card.dialog';
import { SharedBusinessCardsService } from 'src/app/services/http/shared-business-cards.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { BusinessCardsService } from 'src/app/services/http/business-cards.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { ConfirmationDialog } from 'src/app/dialogs/confirmation-dialog/confirmation.dialog';
import { UserType } from 'src/app/models/user-type';
import { Role } from 'src/app/models/role';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProfilePage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected readonly profilePageTab = ProfilePageTab;
    protected readonly userType = UserType;
    protected readonly role = Role;
    protected isReady = signal(false);

    protected showSharedBusinessCards = signal(false);
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

    private routeParamsSubscription?: Subscription;
    private userName!: string;
    private loadingDifferentProfile = false;

    private document = inject(DOCUMENT);
    private authorizationService = inject(AuthorizationService);
    private usersService = inject(UsersService);
    private relationshipsService = inject(RelationshipsService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private windowService = inject(WindowService);
    private preferencesService = inject(PreferencesService);
    private dialog = inject(MatDialog);
    private sharedBusinessCardsService = inject(SharedBusinessCardsService);
    private messageService = inject(MessagesService);
    private businessCardsService = inject(BusinessCardsService);
    private settingsService = inject(SettingsService);
    protected userDisplayService = inject(UserDisplayService);

    override onRouteNavigationStart(navigationStarEvent: NavigationStart): void {
        if (navigationStarEvent.url.includes(this.userName.substring(1))) {
            this.loadingDifferentProfile = false;
        } else {
            this.loadingDifferentProfile = true;
        }
    }

    override async onRouteNavigationEnd(navigationEndEvent: NavigationEnd): Promise<void> {
        if (!this.loadingDifferentProfile) {
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
                    await this.loadFirstStatusesSet();
                }
            }
        }
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();
        this.squareImages.set(this.preferencesService.isSquareImages);
        this.showSharedBusinessCards.set(this.settingsService.publicSettings?.showSharedBusinessCards ?? false);

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
            this.setCardMetaTags();
            this.setFeedLinks();
            this.setNoIndexMeta();

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.clearCardMetaTags();
        this.removeUserLink();
        this.removeFeedLinks();
        this.clearNoIndexMeta();

        this.routeParamsSubscription?.unsubscribe();
    }

    protected async onMainRelationChanged(): Promise<void> {
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
    }

    protected async onRelationChanged(relationship: Relationship): Promise<void> {
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

    protected async onLoadMoreFollowing(): Promise<void> {
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
                    const result = new LinkableResult<User>();
                    result.minId = internalFollowing.minId;
                    result.maxId = internalFollowing.maxId;
                    
                    if (value) {
                        result.data = [...value.data, ...internalFollowing.data];
                    } else {
                        result.data = [...internalFollowing.data];
                    }

                    return result;
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

    protected async onLoadMoreFollowers(): Promise<void> {
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
                    const result = new LinkableResult<User>();
                    result.minId = internalFollowers.minId;
                    result.maxId = internalFollowers.maxId;
                    
                    if (value) {
                        result.data = [...value.data, ...internalFollowers.data];
                    } else {
                        result.data = [...internalFollowers.data];
                    }

                    return result;
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

    protected async onShareBusinessCard(): Promise<void> {
        const businessCardExists = await this.businessCardsService.businessCardExists();
        if (!businessCardExists) {
            const dialogRef = this.dialog.open(ConfirmationDialog, {
                width: '500px',
                data: 'You haven\'t created a business card yet. Would you like to create it now?'
            });

            dialogRef.afterClosed().subscribe(async (result) => {
                if (result?.confirmed) {
                    await this.router.navigate(['/business-card', 'edit']);
                }
            });

            return;
        }

        const dialogRef = this.dialog.open(ShareBusinessCardDialog, { width: '500px' });
        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    const sharedBusinessCard = await this.sharedBusinessCardsService.create(result);
                    this.messageService.showSuccess('Business card has been shared.');

                    this.router.navigate(['/shared-cards', sharedBusinessCard.id], { queryParams: { 'qr': true } });
                } catch (error) {
                    console.error(error);
                    this.messageService.showServerError(error);
                }
            }
        });
    }

    protected onQRCodeClick(): void {
        this.dialog.open(ProfileCodeDialog, {
            data: this.user()?.url
        });
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
            await this.loadFirstStatusesSet();
        }
    }

    private async loadFirstStatusesSet(): Promise<void> {
        const statuses = await this.usersService.statuses(this.userName);
        statuses.context = ContextTimeline.user;
        statuses.user = this.user()?.userName;

        this.statuses.set(statuses);
    }

    private createLink(url: string): void {
        const userLinkMe = this.document.querySelector('link[id="userLinkMe"]');

        if (userLinkMe) {
            userLinkMe.setAttribute('href', url);
        } else {
            const link: HTMLLinkElement = this.document.createElement('link');
            link.setAttribute('href', url);
            link.setAttribute('rel', 'me');
            link.setAttribute('id', 'userLinkMe');

            this.document.head.appendChild(link);
        }
    }

    private removeUserLink(): void {
        const userLinkMe = this.document.querySelector('link[id="userLinkMe"]');
        if (userLinkMe) {
            this.document.head.removeChild(userLinkMe);
        }
    }

    private setCardMetaTags(): void {
        const profileTitle = (this.user()?.name ?? '') + ` (@${this.user()?.userName ?? ''})`;
        const profileDescription = this.htmlToText(this.user()?.bio ?? '');

        // <title>John Doe (@john@vernissage.xxx)</title>
        this.titleService.setTitle(profileTitle);

        // <meta name="description" content="My suite of cool apps is coming together nicely. What would you like to see me build next?">
        this.metaService.updateTag({ name: 'description', content: profileDescription });

        // <meta property="og:url" content="https://vernissage.xxx/@user">
        this.metaService.updateTag({ property: 'og:url', content: `${this.windowService.getApplicationBaseUrl()}/@${this.user()?.userName ?? ''}` });

        // <meta property="og:type" content="website">
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        // <meta property="og:title" content="John Doe (@john@vernissage.xxx)">
        this.metaService.updateTag({ property: 'og:title', content: profileTitle });

        // <meta property="og:description" content="Something apps next?">
        this.metaService.updateTag({ property: 'og:description', content: profileDescription });

        // <meta property="og:logo" content="https://vernissage.xxx/assets/icons/icon-128x128.png" />
        this.metaService.updateTag({ property: 'og:logo', content: `${this.windowService.getApplicationBaseUrl()}/assets/icons/icon-128x128.png` });

        const avatarImage = this.user()?.avatarUrl;
        if (avatarImage) {
            // <meta property="og:image" content="https://files.vernissage.xxx/media_attachments/files/112348.png">
            this.metaService.updateTag({ property: 'og:image', content: avatarImage });

            // <meta property="og:image:width"" content="1532">
            this.metaService.updateTag({ property: 'og:image:width', content: '600' });

            // <meta property="og:image:height"" content="1416">
            this.metaService.updateTag({ property: 'og:image:height', content: '600' });
        } else {
            this.metaService.updateTag({ property: 'og:image', content: '' });
            this.metaService.updateTag({ property: 'og:image:width', content: '' });
            this.metaService.updateTag({ property: 'og:image:height', content: '' });
        }

        // <meta name="twitter:card" content="summary_large_image">
        this.metaService.updateTag({ property: 'twitter:card', content: 'summary_large_image' });
    }

    private clearCardMetaTags(): void {
        this.titleService.setTitle('');
        this.metaService.updateTag({ name: 'description', content: '' });
        this.metaService.updateTag({ property: 'og:url', content: '' });
        this.metaService.updateTag({ property: 'og:type', content: '' });
        this.metaService.updateTag({ property: 'og:title', content: '' });
        this.metaService.updateTag({ property: 'og:description', content: '' });
        this.metaService.updateTag({ property: 'og:logo', content: '' });
        this.metaService.updateTag({ property: 'og:image', content: '' });
        this.metaService.updateTag({ property: 'og:image:width', content: '' });
        this.metaService.updateTag({ property: 'og:image:height', content: '' });
        this.metaService.updateTag({ property: 'twitter:card', content: '' });
    }

    private setFeedLinks(): void {
        const linkUserName = this.userDisplayService.displayName(this.user());

        const existingRssLink = this.document.querySelector('link[id="rssUserLink"]');
        if (existingRssLink) {
            existingRssLink.setAttribute('title', linkUserName + ' feed (RSS)');
            existingRssLink.setAttribute('href', '/rss/users/@' + (this.user()?.userName ?? ''));
        } else {
            const newRssFeed: HTMLLinkElement = this.document.createElement('link');
            newRssFeed.setAttribute('rel', 'alternate');
            newRssFeed.setAttribute('id', 'rssUserLink');
            newRssFeed.setAttribute('type', 'application/rss+xml');
            newRssFeed.setAttribute('title', linkUserName + ' feed (RSS)');
            newRssFeed.setAttribute('href', '/rss/users/@' + (this.user()?.userName ?? ''));
            this.document.head.appendChild(newRssFeed);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomUserLink"]');
        if (existingAtomLink) {
            existingAtomLink.setAttribute('title', linkUserName + ' feed (Atom)');
            existingAtomLink.setAttribute('href', '/atom/users/@' + (this.user()?.userName ?? ''));
        } else {
            const newAtomFeed: HTMLLinkElement = this.document.createElement('link');
            newAtomFeed.setAttribute('rel', 'alternate');
            newAtomFeed.setAttribute('id', 'atomUserLink');
            newAtomFeed.setAttribute('type', 'application/atom+xml');
            newAtomFeed.setAttribute('title', linkUserName + ' feed (Atom)');
            newAtomFeed.setAttribute( 'href', '/atom/users/@' + (this.user()?.userName ?? ''));
            this.document.head.appendChild(newAtomFeed);
        }
    }

    private removeFeedLinks(): void {
        const existingRssLink = this.document.querySelector('link[id="rssUserLink"]');
        if (existingRssLink) {
            this.document.head.removeChild(existingRssLink);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomUserLink"]');
        if (existingAtomLink) {
            this.document.head.removeChild(existingAtomLink);
        }
    }

    private setNoIndexMeta(): void {
        this.metaService.updateTag({ name: 'robots', content: 'noindex, noarchive' });
    }

    private clearNoIndexMeta(): void {
        this.metaService.removeTag('name="robots"');
    }

    private htmlToText(value: string): string {
        const temp = this.document.createElement('div');
        temp.innerHTML = value;
        return temp.textContent || temp.innerText || '';
    }
}
