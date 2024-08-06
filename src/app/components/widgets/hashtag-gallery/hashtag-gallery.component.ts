import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';

@Component({
    selector: 'app-hashtag-gallery',
    templateUrl: './hashtag-gallery.component.html',
    styleUrls: ['./hashtag-gallery.component.scss'],
    animations: fadeInAnimation
})
export class HashtagGalleryComponent extends ResponsiveComponent {
    @Input() hashtags?: LinkableResult<Hashtag>;
    isBrowser = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: object,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    trackByHashtagFn(_: number, item: Hashtag): string | undefined{
        return item.name;
    }
}
