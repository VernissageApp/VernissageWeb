import { Component, input, OnInit, signal } from '@angular/core';
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
    public user = input.required<User | undefined>();
    public size = input<AvatarSize>(AvatarSize.huge);

    protected readonly avatarSize = AvatarSize;
    protected isCircle = signal(false);

    constructor(private preferencesService: PreferencesService) {
    }

    ngOnInit(): void {
        this.isCircle.set(this.preferencesService.isCircleAvatar);
    }
}
