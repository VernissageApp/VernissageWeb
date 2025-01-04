import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, Inject, input, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Status } from 'src/app/models/status';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-statuses-search',
    templateUrl: './statuses-search.component.html',
    styleUrls: ['./statuses-search.component.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class StatusesSearchComponent extends ResponsiveComponent implements OnInit {
    public status = input.required<Status>();

    protected alwaysShowNSFW = signal(false);
    protected mainStatus = computed(() => this.status().reblog ?? this.status());
    protected rendered = computed<SafeHtml>(() => this.mainStatus()?.noteHtml ?? '');

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        private preferencesService: PreferencesService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.alwaysShowNSFW.set(this.preferencesService.alwaysShowNSFW);
    }
}
