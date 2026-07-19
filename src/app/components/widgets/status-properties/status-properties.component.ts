import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Status } from 'src/app/models/status';
import { StatusVisibility } from 'src/app/models/status-visibility';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedDatePipe } from '../../../pipes/localized-date.pipe';

@Component({
    selector: 'app-status-properties',
    templateUrl: './status-properties.component.html',
    styleUrls: ['./status-properties.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatTooltip, MatIcon, TranslatePipe, LocalizedDatePipe]
})
export class StatusPropertiesComponent {
    public status = input.required<Status>();
    public userListsEnabled = input(false);
    public boostedByClick = output<void>();
    public favouritedByClick = output<void>();

    protected readonly statusVisibility = StatusVisibility;

    protected publishedAt = computed(() => {
        return this.status().publishedAt ?? this.status().createdAt;
    });
}
