import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { Relationship } from 'src/app/models/relationship';

@Component({
    selector: 'app-user-popover',
    templateUrl: './user-popover.component.html',
    styleUrls: ['./user-popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserPopoverComponent extends ResponsiveComponent {
    public user = input.required<User>();
    public relationship = input<Relationship>();

    protected readonly avatarSize = AvatarSize;
    protected userDisplayService = inject(UserDisplayService);
}
