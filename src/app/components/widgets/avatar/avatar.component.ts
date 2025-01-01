import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AvatarSize } from './avatar-size';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    standalone: false
})
export class AvatarComponent implements OnInit {
    readonly avatarSize = AvatarSize;

    @Input() user?: User;
    @Input() size: AvatarSize = AvatarSize.huge;

    isCircle = false;

    constructor(private preferencesService: PreferencesService) {
    }

    ngOnInit(): void {
        this.isCircle = this.preferencesService.isCircleAvatar;
    }
}
