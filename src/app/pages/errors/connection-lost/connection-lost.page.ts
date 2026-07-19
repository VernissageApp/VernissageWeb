import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-connection-lost',
    templateUrl: './connection-lost.page.html',
    styleUrls: ['./connection-lost.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, RouterLink, TranslatePipe]
})
export class ConnectionLostPage {
}
