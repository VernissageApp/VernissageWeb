import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Status } from 'src/app/models/status';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-statuses-search',
    templateUrl: './statuses-search.component.html',
    styleUrls: ['./statuses-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusesSearchComponent extends ResponsiveComponent implements OnInit {
    public status = input.required<Status>();

    protected alwaysShowNSFW = signal(false);
    protected mainStatus = computed(() => this.status().reblog ?? this.status());
    protected rendered = computed<SafeHtml>(() => this.mainStatus()?.noteHtml ?? '');

    private preferencesService = inject(PreferencesService);

    override ngOnInit(): void {
        super.ngOnInit();

        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }
}
