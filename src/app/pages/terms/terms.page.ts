import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Rule } from 'src/app/models/rule';
import { WindowService } from 'src/app/services/common/window.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.page.html',
    styleUrls: ['./terms.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TermsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected termsOfServiceContent = signal<SafeHtml>('');
    protected termsOfServiceUpdatedAt = signal('');

    private apiService = '';
    private rules: Rule[] = [];
    private email = '';

    private settingsService = inject(SettingsService);
    private instanceService = inject(InstanceService);
    private windowService = inject(WindowService);

    override ngOnInit(): void {
        super.ngOnInit();

        this.apiService = this.windowService.apiService();
        this.rules = this.instanceService.instance?.rules ?? [];
        this.email = this.instanceService.instance?.email ?? '';
        const rulesHtml = this.generateRulesHtml();

        const publicSettings = this.settingsService.publicSettings;
        if (publicSettings) {
            const termsOfServiceContent = publicSettings.termsOfServiceContent
                .replaceAll('{{hostname}}', this.apiService)
                .replaceAll('{{email}}', this.email)
                .replaceAll('{{rules}}', rulesHtml);

            this.termsOfServiceUpdatedAt.set(publicSettings.termsOfServiceUpdatedAt);
            this.termsOfServiceContent.set(termsOfServiceContent);
        }

        this.isReady.set(true);
    }

    private generateRulesHtml(): string {
        const rulesList = this.rules.map(rule => `<li>${rule.text}</li>`).join('');
        return `<ul>${rulesList}</ul>`;
    }
}
