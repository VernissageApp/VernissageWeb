import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Responsive } from 'src/app/common/responsive';
import { Instance } from 'src/app/models/instance';
import { Rule } from 'src/app/models/rule';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'app-support',
    templateUrl: './support.page.html',
    styleUrls: ['./support.page.scss'],
    animations: fadeInAnimation
})
export class SupportPage extends Responsive implements OnInit {
    isReady = false;
    instance?: Instance;

    constructor(
        private instanceService: InstanceService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        this.isReady = true;
        this.instance = this.instanceService.instance;
    }
}
