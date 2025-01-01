import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss'],
    standalone: false
})
export class UserCardComponent extends ResponsiveComponent {
    readonly avatarSize = AvatarSize;
    @Input() user?: User;

    constructor(protected userDisplayService: UserDisplayService, breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }
}
