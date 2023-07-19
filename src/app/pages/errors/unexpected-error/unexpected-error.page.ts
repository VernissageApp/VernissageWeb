import { Component } from '@angular/core';
import { fadeInAnimation } from "../../../animations/fade-in.animation";

@Component({
    selector: 'app-unexpected-error',
    templateUrl: './unexpected-error.page.html',
    animations: fadeInAnimation
})
export class UnexpectedErrorPage {
}
