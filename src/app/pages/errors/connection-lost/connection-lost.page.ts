import { Component } from '@angular/core';
import { fadeInAnimation } from "../../../animations/fade-in.animation";

@Component({
    selector: 'app-connection-lost',
    templateUrl: './connection-lost.page.html',
    animations: fadeInAnimation
})
export class ConnectionLostPage {
}
