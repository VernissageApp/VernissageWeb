import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LinkableResult } from 'src/app/models/linkable-result';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-users-gallery',
    templateUrl: './users-gallery.component.html',
    styleUrls: ['./users-gallery.component.scss'],
    animations: fadeInAnimation
})
export class UsersGalleryComponent extends ResponsiveComponent {
    @Input() users?: LinkableResult<User>;

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }

    trackByUserFn(_: number, item: User): string | undefined{
        return item.userName;
    }
}
