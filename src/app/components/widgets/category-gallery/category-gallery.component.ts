import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Category } from 'src/app/models/category';
import { CategoryGalleryItemComponent } from '../category-gallery-item/category-gallery-item.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-category-gallery',
    templateUrl: './category-gallery.component.html',
    styleUrls: ['./category-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CategoryGalleryItemComponent, TranslatePipe]
})
export class CategoryGalleryComponent extends ResponsiveComponent {
    public categories = input.required<Category[]>();
    protected isBrowser = signal(false);

    private platformId = inject(PLATFORM_ID);

    constructor() {
        super();
        this.isBrowser.set(isPlatformBrowser(this.platformId));
    }
}
