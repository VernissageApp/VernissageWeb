import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Instance } from 'src/app/models/instance';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { HealthService } from 'src/app/services/http/health.service';
import { Health } from 'src/app/models/health';
import { MessagesService } from 'src/app/services/common/messages.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-support',
    templateUrl: './support.page.html',
    styleUrls: ['./support.page.scss'],
    animations: fadeInAnimation
})
export class SupportPage extends ResponsiveComponent implements OnInit {
    readonly clientVersion = environment.version;

    isReady = false;
    instance?: Instance;
    patreonUrl?: string;
    mastodonUrl?: string;
    totalCost = 0;
    usersSupport = 0;
    health?: Health;

    constructor(
        private instanceService: InstanceService,
        private settingsService: SettingsService,
        private healthService: HealthService,
        private messageService: MessagesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.instance = this.instanceService.instance;

        const internalPatreonUrl = this.settingsService.publicSettings?.patreonUrl ?? '';
        if (internalPatreonUrl.length > 0) {
            this.patreonUrl = internalPatreonUrl;
        }

        const internalMastodonUrl = this.settingsService.publicSettings?.mastodonUrl ?? '';
        if (internalMastodonUrl.length > 0) {
            this.mastodonUrl = internalMastodonUrl;
        }

        this.totalCost = this.settingsService.publicSettings?.totalCost ?? 0;
        this.usersSupport = this.settingsService.publicSettings?.usersSupport ?? 0;
        this.loadHealthStatus();

        this.isReady = true;
    }

    private async loadHealthStatus(): Promise<void> {
        try {
            this.health = await this.healthService.get();
        } catch {
            this.health = new Health();
            this.messageService.showError('Error during downloading system health status.');
        }
    }
}
