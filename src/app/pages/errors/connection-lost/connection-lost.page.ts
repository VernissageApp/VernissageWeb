import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-connection-lost',
    templateUrl: './connection-lost.page.html',
    styleUrls: ['./connection-lost.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ConnectionLostPage {
}
