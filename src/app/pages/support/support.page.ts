import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Instance } from 'src/app/models/instance';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-support',
    templateUrl: './support.page.html',
    styleUrls: ['./support.page.scss'],
    animations: fadeInAnimation
})
export class SupportPage extends ResponsiveComponent implements OnInit {
    isReady = false;
    instance?: Instance;
    patreonUrl?: string;
    totalCost = 0;
    usersSupport = 0;

    constructor(
        private instanceService: InstanceService,
        private settingsService: SettingsService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.instance = this.instanceService.instance;

        const internalPatreonUrl = this.settingsService.publicSettings?.patreonUrl ?? '';
        if (internalPatreonUrl.length > 0) {
            this.patreonUrl = internalPatreonUrl;
        }

        this.totalCost = this.settingsService.publicSettings?.totalCost ?? 0;
        this.usersSupport = this.settingsService.publicSettings?.usersSupport ?? 0;

        this.isReady = true;
    }
}
