import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HomePage implements OnInit {
    protected user = signal<User | undefined>(undefined);
    protected isLoggedIn = signal(false);
    protected isReady = signal(false);

    constructor(private authorizationService: AuthorizationService) {
    }

    async ngOnInit(): Promise<void> {
        this.user.set(this.authorizationService.getUser());

        const isLoggedInInternal = await this.authorizationService.isLoggedIn();
        this.isLoggedIn.set(isLoggedInInternal);

        this.isReady.set(true);
    }
}
