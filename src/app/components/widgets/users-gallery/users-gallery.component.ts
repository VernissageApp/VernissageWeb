import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, input, PLATFORM_ID, signal } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { LinkableResult } from 'src/app/models/linkable-result';
import { User } from 'src/app/models/user';

@Component({
    selector: 'app-users-gallery',
    templateUrl: './users-gallery.component.html',
    styleUrls: ['./users-gallery.component.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class UsersGalleryComponent extends ResponsiveComponent {
    public users = input<LinkableResult<User>>();
    protected isBrowser = signal(false);

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
        this.isBrowser.set(isPlatformBrowser(platformId));
    }
}
