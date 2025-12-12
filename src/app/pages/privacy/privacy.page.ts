import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Rule } from 'src/app/models/rule';
import { WindowService } from 'src/app/services/common/window.service';
import { InstanceService } from 'src/app/services/http/instance.service';
import { SettingsService } from 'src/app/services/http/settings.service';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.page.html',
    styleUrls: ['./privacy.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PrivacyPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected privacyPolicyContent = signal<SafeHtml>('');
    protected privacyPolicyUpdatedAt = signal('');

    private apiService = '';
    private rules: Rule[] = [];
    private email = '';

    private windowService = inject(WindowService);
    private settingsService = inject(SettingsService);
    private instanceService = inject(InstanceService);

    override ngOnInit(): void {
        this.apiService = this.windowService.apiService();
        this.rules = this.instanceService.instance?.rules ?? [];
        this.email = this.instanceService.instance?.email ?? '';
        const rulesHtml = this.generateRulesHtml();

        const publicSettings = this.settingsService.publicSettings;
        if (publicSettings) {
            const privacyPolicyContent = publicSettings.privacyPolicyContent
                .replaceAll('{{hostname}}', this.apiService)
                .replaceAll('{{email}}', this.email)
                .replaceAll('{{rules}}', rulesHtml);

            this.privacyPolicyUpdatedAt.set(publicSettings.privacyPolicyUpdatedAt);
            this.privacyPolicyContent.set(privacyPolicyContent);
        }

        this.isReady.set(true);
    }

    private generateRulesHtml(): string {
        const rulesList = this.rules.map(rule => `<li>${rule.text}</li>`).join('');
        return `<ul>${rulesList}</ul>`;
    }
}
