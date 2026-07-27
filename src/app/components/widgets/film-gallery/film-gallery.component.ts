import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Film } from 'src/app/models/film';
import { FilmGalleryItemComponent } from '../film-gallery-item/film-gallery-item.component';

@Component({
    selector: 'app-film-gallery',
    templateUrl: './film-gallery.component.html',
    styleUrls: ['./film-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FilmGalleryItemComponent, TranslatePipe]
})
export class FilmGalleryComponent extends ResponsiveComponent {
    public films = input.required<Film[]>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
