import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { User } from 'src/app/models/user';
import { AvatarSize } from './avatar-size';
import { PreferencesService } from 'src/app/services/common/preferences.service';
import { UserPayload } from 'src/app/models/user-payload';
import { NgOptimizedImage, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgOptimizedImage, NgClass, TranslatePipe]
})
export class AvatarComponent implements OnInit {
    public user = input.required<User | UserPayload | undefined>();
    public size = input<AvatarSize>(AvatarSize.huge);

    protected readonly avatarSize = AvatarSize;
    protected isCircle = signal(false);

    private preferencesService = inject(PreferencesService);

    ngOnInit(): void {
        this.isCircle.set(this.preferencesService.isCircleAvatar);
    }
}
