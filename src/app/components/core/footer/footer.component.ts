import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, signal } from "@angular/core";
import { ResponsiveComponent } from "src/app/common/responsive";
import { WindowService } from "src/app/services/common/window.service";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent extends ResponsiveComponent implements OnInit {
    protected currentYear = signal('');
    protected apiService = signal('');

    constructor(
        private windowService: WindowService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.currentYear.set(new Date().getFullYear().toString());
        this.apiService.set(this.windowService.apiService());
    }
}