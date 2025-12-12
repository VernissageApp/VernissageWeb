import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Instance } from 'src/app/models/instance';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';
import { HealthService } from 'src/app/services/http/health.service';
import { Health } from 'src/app/models/health';
import { MessagesService } from 'src/app/services/common/messages.service';
import { environment } from 'src/environments/environment';
import { FileSizeService } from 'src/app/services/common/file-size.service';

@Component({
    selector: 'app-support',
    templateUrl: './support.page.html',
    styleUrls: ['./support.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SupportPage extends ResponsiveComponent implements OnInit {
    protected readonly clientVersion = environment.version;

    protected instance = signal<Instance | undefined>(undefined);
    protected health = signal<Health | undefined>(undefined);
    protected patreonUrl = signal<string | undefined>(undefined);
    protected mastodonUrl = signal<string | undefined>(undefined);

    protected isReady = signal(false);
    protected totalCost = signal(0);
    protected usersSupport = signal(0);

    private instanceService = inject(InstanceService);
    private settingsService = inject(SettingsService);
    private healthService = inject(HealthService);
    private messageService = inject(MessagesService);
    private fileSizeService = inject(FileSizeService);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.instance.set(this.instanceService.instance);

        const internalPatreonUrl = this.settingsService.publicSettings?.patreonUrl ?? '';
        if (internalPatreonUrl.length > 0) {
            this.patreonUrl.set(internalPatreonUrl);
        }

        const internalMastodonUrl = this.settingsService.publicSettings?.mastodonUrl ?? '';
        if (internalMastodonUrl.length > 0) {
            this.mastodonUrl.set(internalMastodonUrl);
        }

        this.totalCost.set(this.settingsService.publicSettings?.totalCost ?? 0);
        this.usersSupport.set(this.settingsService.publicSettings?.usersSupport ?? 0);
        this.loadHealthStatus();

        this.isReady.set(true);
    }

    protected getFileSizeString(bytes: number): string {
        return this.fileSizeService.getHumanFileSize(bytes, 0);
    }

    private async loadHealthStatus(): Promise<void> {
        try {
            const healthInternal = await this.healthService.get();
            this.health.set(healthInternal);
        } catch {
            this.health.set(new Health());
            this.messageService.showError('Error during downloading system health status.');
        }
    }
}
