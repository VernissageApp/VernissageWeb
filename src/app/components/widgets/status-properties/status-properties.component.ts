import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Status } from 'src/app/models/status';
import { StatusVisibility } from 'src/app/models/status-visibility';

@Component({
    selector: 'app-status-properties',
    templateUrl: './status-properties.component.html',
    styleUrls: ['./status-properties.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatusPropertiesComponent {
    public status = input.required<Status>();
    protected readonly statusVisibility = StatusVisibility;

    protected publishedAt = computed(() => {
        return this.status().publishedAt ?? this.status().createdAt;
    });
}
