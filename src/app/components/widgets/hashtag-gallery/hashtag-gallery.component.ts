import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
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

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }

    trackByHashtagFn(_: number, item: Hashtag): string | undefined{
        return item.name;
    }
}
