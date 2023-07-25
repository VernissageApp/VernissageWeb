import { Component } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-unexpected-error',
    templateUrl: './unexpected-error.page.html',
    styleUrls: ['./unexpected-error.page.scss'],
    animations: fadeInAnimation
})
export class UnexpectedErrorPage {
}
