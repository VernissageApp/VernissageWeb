import { isPlatformBrowser, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { LinkableResult } from 'src/app/models/linkable-result';
import { HashtagGalleryItemComponent } from '../hashtag-gallery-item/hashtag-gallery-item.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-hashtag-gallery',
    templateUrl: './hashtag-gallery.component.html',
    styleUrls: ['./hashtag-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, HashtagGalleryItemComponent, TranslatePipe]
})
export class HashtagGalleryComponent extends ResponsiveComponent {
    public hashtags = input<LinkableResult<Hashtag>>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
