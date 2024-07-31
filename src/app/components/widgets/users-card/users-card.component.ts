import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';
import { AvatarSize } from '../avatar/avatar-size';

@Component({
    selector: 'app-users-card',
    templateUrl: './users-card.component.html',
    styleUrls: ['./users-card.component.scss']
})
export class UsersCardComponent extends ResponsiveComponent {
    readonly avatarSize = AvatarSize;

    @Input() users?: User[];
    @Input() relationships?: Relationship[];
    @Input() showBio = false;
    @Input() showLoadMore = false;
    @Output() relationChanged = new EventEmitter<Relationship>();
    @Output() loadMore = new EventEmitter();

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }

    getRelationship(user: User): Relationship | undefined {
        return this.relationships?.find(x => x.userId === user.id);
    }

    onRelationChanged(relationship: Relationship): void {
        this.relationChanged.emit(relationship);
    }

    onLoadMore(): void {
        this.loadMore.emit();
    }

    trackByFn(_: number, item: User): string | undefined{
        return item.id;
    }
}
