import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, AvatarComponent, TranslatePipe]
})
export class UserCardComponent extends ResponsiveComponent {
    public user = input<User>();
    protected readonly avatarSize = AvatarSize;
    
    protected userDisplayService = inject(UserDisplayService);
}
