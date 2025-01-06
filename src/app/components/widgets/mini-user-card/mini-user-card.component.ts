import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-mini-user-card',
    templateUrl: './mini-user-card.component.html',
    styleUrls: ['./mini-user-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MiniUserCardComponent {
    public user = input.required<User>();
    public size = input(AvatarSize.small);
    public showUserName = input(true);
    public whiteLink = input(false);

    constructor(protected userDisplayService: UserDisplayService) {
    }
}
