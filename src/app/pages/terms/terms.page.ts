import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Rule } from 'src/app/models/rule';
import { WindowService } from 'src/app/services/common/window.service';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.page.html',
    styleUrls: ['./terms.page.scss'],
    animations: fadeInAnimation
})
export class TermsPage extends ResponsiveComponent implements OnInit {
    isReady = false;
    rules: Rule[] = [];
    apiService = '';
    email = '';

    constructor(
        private instanceService: InstanceService,
        private windowService: WindowService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        this.isReady = true;
        this.rules = this.instanceService.instance?.rules ?? [];
        this.apiService = this.windowService.apiService();
        this.email = this.instanceService.instance?.email ?? '';
    }
}
