import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.page.html',
    styleUrls: ['./privacy.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class PrivacyPage extends ResponsiveComponent implements OnInit {
    isReady = false;
    apiService = '';

    constructor(
        private windowService: WindowService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        this.isReady = true;
        this.apiService = this.windowService.apiService();
    }
}
