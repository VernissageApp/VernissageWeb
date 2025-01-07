import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fadeInAnimation } from 'src/app/animations/fade-in.animation';

@Component({
    selector: 'app-connection-lost',
    templateUrl: './connection-lost.page.html',
    styleUrls: ['./connection-lost.page.scss'],
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ConnectionLostPage {
}
