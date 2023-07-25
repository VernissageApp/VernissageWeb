import { Component } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-access-forbidden',
    templateUrl: './access-forbidden.page.html',
    styleUrls: ['./access-forbidden.page.scss'],
    animations: fadeInAnimation
})
export class AccessForbiddenPage {
}
