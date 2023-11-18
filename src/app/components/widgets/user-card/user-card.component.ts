import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { Responsive } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent extends Responsive {
    readonly avatarSize = AvatarSize;
    @Input() user?: User;

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }
}
