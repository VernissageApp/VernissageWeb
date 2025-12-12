import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LinkableResult } from 'src/app/models/linkable-result';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-users-gallery',
    templateUrl: './users-gallery.component.html',
    styleUrls: ['./users-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UsersGalleryComponent extends ResponsiveComponent {
    public users = input<LinkableResult<User>>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
