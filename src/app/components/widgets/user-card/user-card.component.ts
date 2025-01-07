import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserCardComponent extends ResponsiveComponent {
    public user = input<User>();
    protected readonly avatarSize = AvatarSize;
    
    constructor(protected userDisplayService: UserDisplayService, breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }
}
