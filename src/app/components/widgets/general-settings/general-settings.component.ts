import { Component, input, model, OnInit, signal } from '@angular/core';
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
    standalone: false
})
export class GeneralSettingsComponent implements OnInit {
    public settings = input.required<Settings>();
    public webContactUser = model<User>();
    public systemDefaultUser = model<User>();

    protected eventTypes = signal<string[]>([]);
    
    constructor(
        private settingsService: SettingsService,
        private messageService: MessagesService,
        private instanceService: InstanceService) {
    }

    ngOnInit(): void {
        const values = Object.values(EventType);
        this.eventTypes.set(values);
    }

    async onSubmit(): Promise<void> {
        try {
            const internalSettings = this.settings();
            if (internalSettings) {
                internalSettings.webContactUserId = this.webContactUser()?.id ?? '';
                internalSettings.systemDefaultUserId = this.systemDefaultUser()?.id ?? '';

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

