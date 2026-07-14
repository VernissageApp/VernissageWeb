import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { MatIcon } from '@angular/material/icon';
import { FollowButtonsSectionComponent } from '../follow-buttons-section/follow-buttons-section.component';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-users-card',
    templateUrl: './users-card.component.html',
    styleUrls: ['./users-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, AvatarComponent, MatIcon, FollowButtonsSectionComponent, MatButton, TranslatePipe]
})
export class UsersCardComponent extends ResponsiveComponent {
    public users = input<User[]>();
    public relationships = input<Relationship[]>();
    public showBio = input(false);
    public showLoadMore = input(false);
    
    public relationChanged = output<Relationship>();
    public loadMore = output();

    protected readonly avatarSize = AvatarSize;
    protected userDisplayService = inject(UserDisplayService);

    protected getRelationship(user: User): Relationship | undefined {
        return this.relationships()?.find(x => x.userId === user.id);
    }

    protected onRelationChanged(relationship: Relationship): void {
        this.relationChanged.emit(relationship);
    }

    protected onLoadMore(): void {
        this.loadMore.emit();
    }
}
