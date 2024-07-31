import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit } from "@angular/core";
import { ResponsiveComponent } from "src/app/common/responsive";
import { WindowService } from "src/app/services/common/window.service";
import { InstanceService } from "src/app/services/http/instance.service";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends ResponsiveComponent implements OnInit {
    currentDate = new Date();
    apiService = '';
    version = '';

    constructor(
        private windowService: WindowService,
        private instanceService: InstanceService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.apiService = this.windowService.apiService();
        this.version = this.instanceService.instance?.version ?? '';
    }
}