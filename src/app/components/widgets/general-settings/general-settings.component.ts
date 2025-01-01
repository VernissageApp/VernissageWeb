import { Component, Input } from '@angular/core';
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
export class GeneralSettingsComponent {
    @Input() settings!: Settings;
    @Input() webContactUser?: User;
    @Input() systemDefaultUser?: User;

    eventTypes = Object.values(EventType);
    
    constructor(
        private settingsService: SettingsService,
        private messageService: MessagesService,
        private instanceService: InstanceService) {
    }

    async onSubmit(): Promise<void> {
        try {
            if (this.settings) {
                this.settings.webContactUserId = this.webContactUser?.id ?? '';
                this.settings.systemDefaultUserId = this.systemDefaultUser?.id ?? '';

                await this.settingsService.put(this.settings);

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

