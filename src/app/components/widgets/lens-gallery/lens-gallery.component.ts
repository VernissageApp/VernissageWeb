import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Lens } from 'src/app/models/lens';
import { LensGalleryItemComponent } from '../lens-gallery-item/lens-gallery-item.component';

@Component({
    selector: 'app-lens-gallery',
    templateUrl: './lens-gallery.component.html',
    styleUrls: ['./lens-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LensGalleryItemComponent, TranslatePipe]
})
export class LensGalleryComponent extends ResponsiveComponent {
    public lenses = input.required<Lens[]>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
