import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, signal } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Rule } from 'src/app/models/rule';
import { WindowService } from 'src/app/services/common/window.service';
import { InstanceService } from 'src/app/services/http/instance.service';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.page.html',
    styleUrls: ['./terms.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class TermsPage extends ResponsiveComponent implements OnInit {
    protected isReady = signal(false);
    protected rules = signal<Rule[]>([]);
    protected apiService = signal('');
    protected email = signal('');

    constructor(
        private instanceService: InstanceService,
        private windowService: WindowService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.rules.set(this.instanceService.instance?.rules ?? []);
        this.apiService.set(this.windowService.apiService());
        this.email.set(this.instanceService.instance?.email ?? '');

        this.isReady.set(true);
    }
}
