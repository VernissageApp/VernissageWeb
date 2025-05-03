import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { ResponsiveComponent } from "src/app/common/responsive";
import { WindowService } from "src/app/services/common/window.service";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FooterComponent extends ResponsiveComponent implements OnInit {
    protected currentYear = signal('');
    protected apiService = signal('');

    private windowService = inject(WindowService);

    override ngOnInit(): void {
        super.ngOnInit();

        this.currentYear.set(new Date().getFullYear().toString());
        this.apiService.set(this.windowService.apiService());
    }
}