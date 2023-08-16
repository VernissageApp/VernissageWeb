import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Relationship } from 'src/app/models/relationship';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-users-card',
    templateUrl: './users-card.component.html',
    styleUrls: ['./users-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersCardComponent {
    @Input() users?: User[];
    @Input() relationships?: Relationship[];
    @Input() showBio = false;
    @Output() relationChanged = new EventEmitter();

    getRelationship(user: User): Relationship | undefined {
        return this.relationships?.find(x => x.userId === user.id);
    }

    onRelationChanged(): void {
        this.relationChanged.emit();
    }
}
