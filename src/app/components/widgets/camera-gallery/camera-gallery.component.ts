import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Camera } from 'src/app/models/camera';
import { CameraGalleryItemComponent } from '../camera-gallery-item/camera-gallery-item.component';

@Component({
    selector: 'app-camera-gallery',
    templateUrl: './camera-gallery.component.html',
    styleUrls: ['./camera-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CameraGalleryItemComponent, TranslatePipe]
})
export class CameraGalleryComponent extends ResponsiveComponent {
    public cameras = input.required<Camera[]>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
