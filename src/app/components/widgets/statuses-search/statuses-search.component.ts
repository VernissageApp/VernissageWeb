import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Status } from 'src/app/models/status';
import { StatusVisibility } from 'src/app/models/status-visibility';

@Component({
    selector: 'app-statuses-search',
    templateUrl: './statuses-search.component.html',
    styleUrls: ['./statuses-search.component.scss'],
    animations: fadeInAnimation
})
export class StatusesSearchComponent extends ResponsiveComponent implements OnInit {
    readonly statusVisibility = StatusVisibility;
    private readonly numberOfVisibleStatuses = 10;

    @Input() status!: Status;
    mainStatus!: Status;
    rendered?: SafeHtml = '';
    isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    override ngOnInit(): void {
        this.mainStatus = this.getMainStatus(this.status);
        this.rendered = this.mainStatus?.noteHtml ?? '';
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }
}
