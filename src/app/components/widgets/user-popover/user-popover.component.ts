import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { Relationship } from 'src/app/models/relationship';

@Component({
    selector: 'app-user-popover',
    templateUrl: './user-popover.component.html',
    styleUrls: ['./user-popover.component.scss']
})
export class UserPopoverComponent extends ResponsiveComponent {
    readonly avatarSize = AvatarSize;
    @Input() user?: User;
    @Input() relationship?: Relationship;

    constructor(
        protected userDisplayService: UserDisplayService,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }
}
