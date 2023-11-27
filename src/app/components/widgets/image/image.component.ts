import { Component, Input, OnInit } from '@angular/core';
import { AvatarSize } from '../avatar/avatar-size';
import { User } from 'src/app/models/user';
import { PreferencesService } from 'src/app/services/common/preferences.service';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
    readonly avatarSize = AvatarSize;

    @Input() imageSrc?: string;
    @Input() alt?: string;
    @Input() user?: User;
    @Input() horizontal = true;

    showAvatar = true;
    showAltIcon = false;

    constructor(private preferencesService: PreferencesService) {
    }

    ngOnInit(): void {
        this.showAvatar = this.preferencesService.showAvatars;
        this.showAltIcon = this.preferencesService.showAltIcon;
    }
}
