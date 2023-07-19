import { Component } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-page-not-found',
    templateUrl: './page-not-found.page.html',
    animations: fadeInAnimation
})
export class PageNotFoundPage {
}
