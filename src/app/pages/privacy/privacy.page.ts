import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { WindowService } from 'src/app/services/common/window.service';

@Component({
    selector: 'app-privacy',
    templateUrl: './privacy.page.html',
    styleUrls: ['./privacy.page.scss'],
    animations: fadeInAnimation
})
export class PrivacyPage extends Responsive implements OnInit {
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
