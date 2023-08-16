import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-users-card',
    templateUrl: './users-card.component.html',
    styleUrls: ['./users-card.component.scss']
})
export class UsersCardComponent {
    @Input() users?: User[];
    @Input() relationships?: Relationship[];
    @Input() showBio = false;
    @Output() relationChanged = new EventEmitter<Relationship>();

    getRelationship(user: User): Relationship | undefined {
        return this.relationships?.find(x => x.userId === user.id);
    }

    onRelationChanged(relationship: Relationship): void {
        this.relationChanged.emit(relationship);
    }

    trackByFn(_: number, item: User): string | undefined{
        return item.id;
     }
}
