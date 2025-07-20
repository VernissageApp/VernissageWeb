import { ChangeDetectionStrategy, Component, inject, input, model, OnInit, signal } from '@angular/core';
import { Settings } from 'src/app/models/settings';
import { SettingsService } from 'src/app/services/http/settings.service';
import { MessagesService } from 'src/app/services/common/messages.service';
import { EventType } from 'src/app/models/event-type';
import { InstanceService } from 'src/app/services/http/instance.service';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GeneralSettingsComponent implements OnInit {
    public settings = input.required<Settings>();
    public webContactUser = model<User>();
    public systemDefaultUser = model<User>();

    protected eventTypes = signal<string[]>([]);

    private settingsService = inject(SettingsService);
    private messageService = inject(MessagesService);
    private instanceService = inject(InstanceService);

    ngOnInit(): void {
        const values = Object.values(EventType);
        this.eventTypes.set(values);
    }

    protected async onSubmit(): Promise<void> {
        try {
            const internalSettings = this.settings();
            if (internalSettings) {
                internalSettings.webContactUserId = this.webContactUser()?.id ?? '';
                internalSettings.systemDefaultUserId = this.systemDefaultUser()?.id ?? '';

                // Convert eventual input strings into numbers.
                internalSettings.maximumNumberOfInvitations = +internalSettings.maximumNumberOfInvitations;
                internalSettings.maxCharacters = +internalSettings.maxCharacters;
                internalSettings.maxMediaAttachments = +internalSettings.maxMediaAttachments;
                internalSettings.imageSizeLimit = +internalSettings.imageSizeLimit;
                internalSettings.emailPort = +internalSettings.emailPort;
                internalSettings.statusPurgeAfterDays = +internalSettings.statusPurgeAfterDays;
                internalSettings.imageQuality = +internalSettings.imageQuality;
                internalSettings.totalCost = +internalSettings.totalCost;
                internalSettings.usersSupport = +internalSettings.usersSupport;

                await this.settingsService.put(internalSettings);

                await Promise.all([
                    this.instanceService.load(),
                    this.settingsService.load()
                ]);

                this.messageService.showSuccess('Settings was saved.');
            }
        } catch (error) {
            console.error(error);
            this.messageService.showServerError(error);
        }
    }
}

