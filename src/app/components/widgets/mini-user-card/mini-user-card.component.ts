import { Component, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-mini-user-card',
    templateUrl: './mini-user-card.component.html',
    styleUrls: ['./mini-user-card.component.scss'],
    standalone: false
})
export class MiniUserCardComponent {
    readonly avatarSize = AvatarSize;

    @Input() user?: User;
    @Input() size: AvatarSize = AvatarSize.small;
    @Input() showUserName = true;
    @Input() whiteLink = false;

    constructor(protected userDisplayService: UserDisplayService) {
    }
}
