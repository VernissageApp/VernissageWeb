import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';
import { UserDisplayService } from 'src/app/services/common/user-display.service';

@Component({
    selector: 'app-users-card',
    templateUrl: './users-card.component.html',
    styleUrls: ['./users-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
