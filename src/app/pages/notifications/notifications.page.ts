import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { RandomGeneratorService } from 'src/app/services/common/random-generator.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NotificationsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected readonly notificationType = NotificationType;
    protected readonly avatarSize = AvatarSize;

    protected isReady = signal(false);
    protected showLoadMore = signal(true);
    protected showEnableNotificationButton = signal(false);

    protected notifications = signal<Notification[]>([]);
    protected minId = signal<string | undefined>(undefined);
    protected maxId = signal<string | undefined>(undefined);

    private routeParamsSubscription?: Subscription;

    private notificationsService = inject(NotificationsService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private swPushService = inject(SwPush);
    private activatedRoute = inject(ActivatedRoute);
    private randomGeneratorService = inject(RandomGeneratorService);
    private router = inject(Router);
    public dialog = inject(MatDialog);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        const isPushApiEnabled = this.notificationsService.isPushApiSupported() && this.swPushService.isEnabled && !!this.settingsService.publicSettings?.webPushVapidPublicKey;
        this.showEnableNotificationButton.set(isPushApiEnabled);

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            this.loadingService.showLoader();
            await this.onLoadMore();
            
            const linkedNotifications = this.notifications();
            if (linkedNotifications?.length) {
                await this.notificationsService.marker(linkedNotifications[0].id);
                this.notificationsService.changes.next(0);
            }

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }

    protected async onLoadMore(): Promise<void> {
        const internalNotifications = await this.notificationsService.get(undefined, this.maxId(), undefined);

        if (this.notifications()) {
            if (internalNotifications.data.length > 0) {
                this.notifications.update(x => [...x, ...internalNotifications.data]);
                this.minId.set(internalNotifications.minId);
                this.maxId.set(internalNotifications.maxId);
            } else {
                this.showLoadMore.set(false);
            }
        } else {
            this.notifications.set(internalNotifications.data);
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

    protected openNotificationsSettings(): void {
        this.dialog.open(NotificationSettingsDialog, {
            width: '500px'
        });
    }

    protected getNotificationText(notification: Notification): string {
        switch (notification.notificationType) {
            case NotificationType.Mention:
                return 'mentioned you';
            case NotificationType.Status:
                return 'published photo';
            case NotificationType.Reblog:
                return 'boost your photo';
            case NotificationType.Follow:
                return 'followed you';
            case NotificationType.FollowRequest:
                return 'want to follow you';
            case NotificationType.Favourite:
                if (!notification.mainStatus) {
                    return 'favourited your photo';
                } else {
                    return 'favourited your comment';
                }
            case NotificationType.Update:
                return 'edited photo';
            case NotificationType.AdminSignUp:
                return 'is a new user';
            case NotificationType.AdminReport:
                return 'has been reported';
            case NotificationType.NewComment:
                return 'wrote new comment';
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
}
