import { Component, model, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { PushSubscription as PushSubscriptionDto } from 'src/app/models/push-subscription';
import { Role } from 'src/app/models/role';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { LoadingService } from 'src/app/services/common/loading.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { PushSubscriptionsService } from 'src/app/services/http/push-subscriptions.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-notification-settings-dialog',
    templateUrl: 'notification-settings.dialog.html',
    styleUrls: ['notification-settings.dialog.scss'],
    standalone: false
})
export class NotificationSettingsDialog implements OnInit {
    protected notificationsEnabled = model(false);
    protected switchDisabled = signal(false);

    protected webPushMentionEnabled = model(true);
    protected webPushStatusEnabled = model(true);
    protected webPushReblogEnabled = model(true);
    protected webPushFollowEnabled = model(true);
    protected webPushFollowRequestEnabled = model(true);
    protected webPushFavouriteEnabled = model(true);
    protected webPushUpdateEnabled = model(true);
    protected webPushAdminSignUpEnabled = model(true);
    protected webPushAdminReportEnabled = model(true);
    protected webPushNewCommentEnabled = model(true);

    private endpoint?: string;
    private p256dh?: string;
    private auth?: string;

    constructor(
        private messageService: MessagesService,
        private swPushService: SwPush,
        private loadingService: LoadingService,
        private authorizationService: AuthorizationService,
        private settingsService: SettingsService,
        private pushSubscriptionsService: PushSubscriptionsService,
        public dialogRef: MatDialogRef<NotificationSettingsDialog>) {
    }

    async ngOnInit(): Promise<void> {
        this.loadingService.showLoader();

        // Get subscription from browser.
        const subscription = await firstValueFrom(this.swPushService.subscription);

        // Download subscription from server.
        const currentSubscription = await this.pushSubscriptionsService.getPushSubscription(subscription?.endpoint);

        if (currentSubscription) {
            this.webPushMentionEnabled.set(currentSubscription.webPushMentionEnabled);
            this.webPushStatusEnabled.set(currentSubscription.webPushStatusEnabled);
            this.webPushReblogEnabled.set(currentSubscription.webPushReblogEnabled);
            this.webPushFollowEnabled.set(currentSubscription.webPushFollowEnabled);
            this.webPushFollowRequestEnabled.set(currentSubscription.webPushFollowRequestEnabled);
            this.webPushFavouriteEnabled.set(currentSubscription.webPushFavouriteEnabled);
            this.webPushUpdateEnabled.set(currentSubscription.webPushUpdateEnabled);
            this.webPushAdminSignUpEnabled.set(currentSubscription.webPushAdminSignUpEnabled);
            this.webPushAdminReportEnabled.set(currentSubscription.webPushAdminReportEnabled);
            this.webPushNewCommentEnabled.set(currentSubscription.webPushNewCommentEnabled);
        }

        this.switchDisabled.set(Notification.permission == 'denied');
        this.notificationsEnabled.set(Notification.permission == 'granted' && !!currentSubscription?.webPushNotificationsEnabled);

        this.loadingService.hideLoader();
    }

    isAdministrator(): boolean {
        return this.authorizationService.hasRole(Role.Administrator);
    }

    isModerator(): boolean {
        return this.authorizationService.hasRole(Role.Moderator);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onNotificationsChange(): void {
        if (this.notificationsEnabled()) {
            this.subscribeToPush();
        }
    }

    async onSubmit(): Promise<void> {
        try {
            await this.subscribeToPush();

            if (!this.endpoint || !this.p256dh || !this.auth) {
                this.messageService.showError('Error during generating encryption keys for Web push.');
                return;
            }

            const pusSubscription = new PushSubscriptionDto();
            pusSubscription.endpoint = this.endpoint;
            pusSubscription.userAgentPublicKey = this.p256dh;
            pusSubscription.auth = this.auth;

            pusSubscription.webPushNotificationsEnabled = this.notificationsEnabled();
            pusSubscription.webPushMentionEnabled = this.webPushMentionEnabled();
            pusSubscription.webPushStatusEnabled = this.webPushStatusEnabled();
            pusSubscription.webPushReblogEnabled = this.webPushReblogEnabled();
            pusSubscription.webPushFollowEnabled = this.webPushFollowEnabled();
            pusSubscription.webPushFollowRequestEnabled = this.webPushFollowRequestEnabled();
            pusSubscription.webPushFavouriteEnabled = this.webPushFavouriteEnabled();
            pusSubscription.webPushUpdateEnabled = this.webPushUpdateEnabled();
            pusSubscription.webPushAdminSignUpEnabled = this.webPushAdminSignUpEnabled();
            pusSubscription.webPushAdminReportEnabled = this.webPushAdminReportEnabled();
            pusSubscription.webPushNewCommentEnabled = this.webPushNewCommentEnabled();

            await this.pushSubscriptionsService.create(pusSubscription);
            this.messageService.showSuccess('Notification settings has been saved.');

            this.dialogRef.close({ confirmed: true});
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }

    async subscribeToPush(): Promise<void> {
        if (!this.settingsService.publicSettings?.webPushVapidPublicKey) {
            this.messageService.showError('Web push public key is not set.');
            return;
        }

        try {
            if (!this.swPushService.isEnabled) {
                this.messageService.showError('Web push notifications for the website are disabled in the browser.');
                return;
            }

            const subscription = await this.swPushService.requestSubscription({
                serverPublicKey: this.settingsService.publicSettings.webPushVapidPublicKey
            });

            const jsonObject = subscription.toJSON();
            this.endpoint = jsonObject.endpoint;
            this.p256dh = jsonObject.keys?.p256dh;
            this.auth = jsonObject.keys?.auth;
        } catch (err) {
            this.messageService.showError('Unexpected error during generating Web push subscription.');
            console.error('Could not subscribe due to:', err);
        }
    }
}