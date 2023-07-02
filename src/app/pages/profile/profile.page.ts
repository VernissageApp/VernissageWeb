import { Component } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage {
}
