import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Category } from 'src/app/models/category';

@Component({
    selector: 'app-category-gallery',
    templateUrl: './category-gallery.component.html',
    styleUrls: ['./category-gallery.component.scss'],
    animations: fadeInAnimation
})
export class CategoryGalleryComponent extends ResponsiveComponent {
    @Input() categories?: Category[] = [];

    constructor(breakpointObserver: BreakpointObserver) {
        super(breakpointObserver);
    }

    trackByCategoryFn(_: number, item: Category): string | undefined {
        return item.id;
    }
}
