import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { PersistanceService } from 'src/app/services/persistance/persistance.service';
import { AvatarSize } from './avatar-size';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
    readonly avatarSize = AvatarSize;

    @Input() user?: User;
    @Input() size: AvatarSize = AvatarSize.huge;

    isCircle = false;

    constructor(private persistanceService: PersistanceService) {
    }

    ngOnInit(): void {
        const avatar = this.persistanceService.get('avatar');
        if (avatar === 'circle') {
            this.isCircle = true;
        }
    }
}
