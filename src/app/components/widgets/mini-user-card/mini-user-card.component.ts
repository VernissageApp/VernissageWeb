import { Component, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';

@Component({
    selector: 'app-mini-user-card',
    templateUrl: './mini-user-card.component.html',
    styleUrls: ['./mini-user-card.component.scss']
})
export class MiniUserCardComponent {
    readonly avatarSize = AvatarSize;

    @Input() user?: User;
    @Input() size: AvatarSize = AvatarSize.small;
    @Input() showUserName = true;
    @Input() whiteLink = false;
}
