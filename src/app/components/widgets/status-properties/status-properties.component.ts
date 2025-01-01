import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { Status } from 'src/app/models/status';
import { StatusVisibility } from 'src/app/models/status-visibility';

@Component({
    selector: 'app-status-properties',
    templateUrl: './status-properties.component.html',
    styleUrls: ['./status-properties.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fadeInAnimation,
    standalone: false
})
export class StatusPropertiesComponent {
    readonly statusVisibility = StatusVisibility;
    @Input() status!: Status;
}
