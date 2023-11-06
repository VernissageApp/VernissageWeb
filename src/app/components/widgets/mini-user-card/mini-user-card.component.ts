import { Component, Input } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-mini-user-card',
    templateUrl: './mini-user-card.component.html',
    styleUrls: ['./mini-user-card.component.scss']
})
export class MiniUserCardComponent {
    @Input() user?: User;
}
