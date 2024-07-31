import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent extends ResponsiveComponent {
    readonly avatarSize = AvatarSize;
    @Input() user?: User;

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }
}
