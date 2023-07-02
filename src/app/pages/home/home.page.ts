import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage {
}
