import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Notification } from '../../models/notification';
import { NotificationsService } from 'src/app/services/http/notifications.service';
import { Status } from 'src/app/models/status';
import { NotificationType } from 'src/app/models/notification-type';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { AvatarSize } from 'src/app/components/widgets/avatar/avatar-size';
import { SwPush } from '@angular/service-worker';
import { SettingsService } from 'src/app/services/http/settings.service';
import { NotificationSettingsDialog } from 'src/app/dialogs/notification-settings-dialog/notification-settings.dialog';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, NavigationStart, Router } from '@angular/router';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';
import { TranslateService } from '@ngx-translate/core';
import { delay, filter, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UserPayload } from 'src/app/models/user-payload';
import { NotificationAvatarPopoverRequest } from 'src/app/models/notification-avatar-popover-request';
import { NotificationGroupItem, NotificationItem, NotificationListItem } from 'src/app/models/notification-list-item';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NotificationsPage extends ResponsiveComponent implements OnInit, OnDestroy, AfterViewInit {
    protected readonly notificationType = NotificationType;
    protected readonly avatarSize = AvatarSize;

    protected isReady = signal(false);
    protected showLoadMore = signal(true);
    protected showEnableNotificationButton = signal(false);

    protected notifications = signal<Notification[]>([]);
    protected notificationItems = signal<NotificationListItem[]>([]);
    protected minId = signal<string | undefined>(undefined);
    protected maxId = signal<string | undefined>(undefined);
    protected popoverVisible = signal(false);
    protected popoverUser = signal<User | undefined>(undefined);
    protected popoverAnchorKey = signal('');
    protected popoverRelationship = signal<Relationship | undefined>(undefined);
    protected signedInUser = signal<UserPayload | undefined>(undefined);

    protected avatarMouseenter = new Subject<NotificationAvatarPopoverRequest>();
    protected avatarMouseleave = new Subject<void>();

    private routeParamsSubscription?: Subscription;
    private routeNavigationStartSubscription?: Subscription;
    private popoverSubscriptions = new Subscription();

    private notificationsService = inject(NotificationsService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private swPushService = inject(SwPush);
    private activatedRoute = inject(ActivatedRoute);
    private randomGeneratorService = inject(RandomGeneratorService);
    private router = inject(Router);
    private translateService = inject(TranslateService);
    private relationshipsService = inject(RelationshipsService);
    private authorizationService = inject(AuthorizationService);
    public dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const isPushApiEnabled = this.notificationsService.isPushApiSupported() && this.swPushService.isEnabled && !!this.settingsService.publicSettings?.webPushVapidPublicKey;
        this.showEnableNotificationButton.set(isPushApiEnabled);
        this.signedInUser.set(this.authorizationService.getUser());

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            this.loadingService.showLoader();

            this.minId.set(undefined);
            this.maxId.set(undefined);
            
            await this.onLoadMore(true);
            
            const linkedNotifications = this.notifications();
            if (linkedNotifications?.length) {
                await this.notificationsService.marker(linkedNotifications[0].id);
                this.notificationsService.changes.next(0);
            }

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });

        this.routeNavigationStartSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationStart))
            .subscribe(() => {
                this.hideUserPopover();
                this.avatarMouseleave.next();
            });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.hideUserPopover();
        this.routeParamsSubscription?.unsubscribe();
        this.routeNavigationStartSubscription?.unsubscribe();
        this.popoverSubscriptions.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.popoverSubscriptions.add(
            this.avatarMouseenter
                .pipe(switchMap(request => of(request).pipe(delay(500), takeUntil(this.avatarMouseleave))))
                .subscribe(async (request) => {
                    if (!request.user) {
                        return;
                    }

                    this.popoverUser.set(request.user);
                    this.popoverAnchorKey.set(request.anchorKey);
                    this.popoverRelationship.set(undefined);
                    this.popoverVisible.set(true);

                    if (request.user.id && this.signedInUser()?.id !== request.user.id) {
                        const downloadedRelationship = await this.relationshipsService.get(request.user.id);

                        if (this.popoverAnchorKey() === request.anchorKey && this.getUserPopoverKey(this.popoverUser()) === this.getUserPopoverKey(request.user)) {
                            this.popoverRelationship.set(downloadedRelationship);
                        }
                    }
                })
        );

        this.popoverSubscriptions.add(
            this.avatarMouseleave
                .pipe(switchMap(() => of(null).pipe(delay(500), takeUntil(this.avatarMouseenter))))
                .subscribe(() => {
                    this.hideUserPopover();
                })
        );
    }

    protected async onLoadMore(reload: boolean): Promise<void> {
        const internalNotifications = await this.notificationsService.get(undefined, this.maxId(), undefined);

        if (!reload && this.notifications()) {
            if (internalNotifications.data.length > 0) {
                const uniqueIncoming = this.appendUniqueNotifications(internalNotifications.data);
                this.notificationItems.update(x => [...x, ...this.makeNotificationItems(uniqueIncoming)]);
                this.minId.set(internalNotifications.minId);
                this.maxId.set(internalNotifications.maxId);
            } else {
                this.showLoadMore.set(false);
            }
        } else {
            this.notifications.set(internalNotifications.data);
            this.notificationItems.set(this.makeNotificationItems(internalNotifications.data));
            this.minId.set(internalNotifications.minId);
            this.maxId.set(internalNotifications.maxId);

            if (this.notifications().length === 0) {
                this.showLoadMore.set(false);
            }
        }
    }

    protected onNotificationsRefresh(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { f: this.randomGeneratorService.generateString(8) },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    protected getAttachmentUrl(status: Status): string | undefined {
        if (status.attachments && status.attachments.length > 0) {
            return status.attachments[0].smallFile?.url;
        }

        return undefined
    }

    protected getAttachmentAlt(status: Status): string | undefined {
        if (status.attachments && status.attachments.length > 0) {
            return status.attachments[0].description;
        }

        return undefined
    }

    protected getLinkedStatus(notification: Notification): Status | undefined {
        if (notification.mainStatus && this.getAttachmentUrl(notification.mainStatus)) {
            return notification.mainStatus;
        }

        if (notification.status && this.getAttachmentUrl(notification.status)) {
            return notification.status;
        }

        return notification.mainStatus ?? notification.status;
    }

    protected openNotificationsSettings(): void {
        this.dialog.open(NotificationSettingsDialog, {
            width: '500px'
        });
    }

    protected isUserPopoverVisible(user: User | undefined, anchorKey: string): boolean {
        return this.popoverVisible()
            && this.popoverAnchorKey() === anchorKey
            && this.getUserPopoverKey(this.popoverUser()) === this.getUserPopoverKey(user);
    }

    protected getNotificationText(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return this.translateService.instant('pages.notifications.types.mention');
            case NotificationType.Status:
                return this.translateService.instant('pages.notifications.types.status');
            case NotificationType.Reblog:
                return this.translateService.instant('pages.notifications.types.reblog');
            case NotificationType.Follow:
                return this.translateService.instant('pages.notifications.types.follow');
            case NotificationType.FollowRequest:
                return this.translateService.instant('pages.notifications.types.followRequest');
            case NotificationType.Favourite:
                if (!notification.mainStatus) {
                    return this.translateService.instant('pages.notifications.types.favouriteStatus');
                } else {
                    return this.translateService.instant('pages.notifications.types.favouriteComment');
                }
            case NotificationType.Update:
                return this.translateService.instant('pages.notifications.types.update');
            case NotificationType.AdminSignUp:
                return this.translateService.instant('pages.notifications.types.adminSignUp');
            case NotificationType.AdminReport:
                return this.translateService.instant('pages.notifications.types.adminReport');
            case NotificationType.NewComment:
                return this.translateService.instant('pages.notifications.types.newComment');
            default:
                return '';
        }
    }

    protected getNotificationIcon(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'alternate_email';
            case NotificationType.Status:
                return 'fiber_new';
            case NotificationType.Reblog:
                return 'swap_vertical_circle';
            case NotificationType.Follow:
                return 'person_add';
            case NotificationType.FollowRequest:
                return 'person_outline';
            case NotificationType.Favourite:
                return 'star';
            case NotificationType.Update:
                return 'edit';
            case NotificationType.AdminSignUp:
                return 'account_box';
            case NotificationType.AdminReport:
                return 'report_problem';
            case NotificationType.NewComment:
                return 'chat_bubble';
            default:
                return '';
        }
    }

    protected getNotificationIconClass(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'mention';
            case NotificationType.Status:
                return 'status';
            case NotificationType.Reblog:
                return 'reblog';
            case NotificationType.Follow:
                return 'follow';
            case NotificationType.FollowRequest:
                return 'follow-request';
            case NotificationType.Favourite:
                return 'favourite';
            case NotificationType.Update:
                return 'update';
            case NotificationType.AdminSignUp:
                return 'admin-sign-up';
            case NotificationType.AdminReport:
                return 'admin-report';
            case NotificationType.NewComment:
                return 'new-comments';
            default:
                return '';
        }
    }

    private appendUniqueNotifications(incoming: Notification[]): Notification[] {
        const existingKeys = new Set(this.notifications().map(notification => this.getNotificationUniquenessKey(notification)));
        const uniqueIncoming = incoming.filter(notification => {
            const uniquenessKey = this.getNotificationUniquenessKey(notification);
            const isUnique = !existingKeys.has(uniquenessKey);
            existingKeys.add(uniquenessKey);

            return isUnique;
        });

        this.notifications.update(notifications => [...notifications, ...uniqueIncoming]);

        return uniqueIncoming;
    }

    private makeNotificationItems(pageNotifications: Notification[]): NotificationListItem[] {
        const groupsByKey = new Map<string, Notification[]>();
        const emittedGroupKeys = new Set<string>();

        for (const notification of pageNotifications) {
            const groupingKey = this.getNotificationGroupingKey(notification);

            if (!groupingKey) {
                continue;
            }

            groupsByKey.set(groupingKey, [...(groupsByKey.get(groupingKey) ?? []), notification]);
        }

        const items: NotificationListItem[] = [];

        for (const notification of pageNotifications) {
            const groupingKey = this.getNotificationGroupingKey(notification);
            const groupedNotifications = groupingKey ? groupsByKey.get(groupingKey) : undefined;

            if (!groupingKey || !groupedNotifications || groupedNotifications.length < 2) {
                items.push(this.makeNotificationItem(notification));
                continue;
            }

            if (emittedGroupKeys.has(groupingKey)) {
                continue;
            }

            emittedGroupKeys.add(groupingKey);
            items.push(this.makeNotificationGroupItem(groupedNotifications));
        }

        return items;
    }

    private makeNotificationItem(notification: Notification): NotificationItem {
        return {
            kind: 'notification',
            id: this.getNotificationUniquenessKey(notification),
            notification
        };
    }

    private makeNotificationGroupItem(notifications: Notification[]): NotificationGroupItem {
        const representative = notifications[0];

        return {
            kind: 'group',
            id: `group:${notifications.map(notification => this.getNotificationUniquenessKey(notification)).join('|')}`,
            notifications,
            representative,
            visibleNotifications: notifications.slice(0, 7),
            hiddenNotificationsCount: Math.max(0, notifications.length - 7),
            latestCreatedAt: this.getLatestCreatedAt(notifications),
            linkedStatus: this.getLinkedStatus(representative)
        };
    }

    private getNotificationGroupingKey(notification: Notification): string | undefined {
        switch (notification.notificationType) {
            case NotificationType.Follow:
                return notification.notificationType;
            case NotificationType.Favourite:
            case NotificationType.Reblog: {
                const linkedStatusId = this.getLinkedStatus(notification)?.id;

                if (!linkedStatusId) {
                    return undefined;
                }

                return `${notification.notificationType}|${linkedStatusId}|${this.getNotificationText(notification)}`;
            }
            default:
                return undefined;
        }
    }

    private getNotificationUniquenessKey(notification: Notification): string {
        if (notification.id) {
            return `id:${notification.id}`;
        }

        const userKey = notification.byUser?.id ?? notification.byUser?.userName ?? 'unknown-user';
        const typeKey = notification.notificationType ?? 'unknown-type';
        const dateKey = notification.createdAt ?? '';

        return `${typeKey}|${userKey}|${dateKey}`;
    }

    private getLatestCreatedAt(notifications: Notification[]): string {
        return notifications
            .map(notification => notification.createdAt)
            .filter((createdAt): createdAt is string => !!createdAt)
            .sort()
            .at(-1) ?? '';
    }

    private hideUserPopover(): void {
        this.popoverVisible.set(false);
        this.popoverUser.set(undefined);
        this.popoverAnchorKey.set('');
        this.popoverRelationship.set(undefined);
    }

    private getUserPopoverKey(user?: User): string {
        return user?.id ?? user?.userName ?? '';
    }
}
