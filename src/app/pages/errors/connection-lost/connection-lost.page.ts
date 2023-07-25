import { Component } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-connection-lost',
    templateUrl: './connection-lost.page.html',
    styleUrls: ['./connection-lost.page.scss'],
    animations: fadeInAnimation
})
export class ConnectionLostPage {
}
