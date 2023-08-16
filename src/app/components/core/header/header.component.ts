import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { InstanceService } from 'src/app/services/http/instance.service';
import { AuthorizationService } from '../../../services/authorization/authorization.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    public user?: User | null;
    public avatarUrl = "assets/avatar.svg";
    private userChangeSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private instanceService: InstanceService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.user = this.authorizationService.getUser();
        this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';

        this.userChangeSubscription = this.authorizationService.changes.subscribe(user => {
            this.user = user;
            this.avatarUrl = this.user?.avatarUrl ?? 'assets/avatar.svg';
        });
    }

    ngOnDestroy(): void {
        this.userChangeSubscription?.unsubscribe();
    }

    async signOut(): Promise<void> {
        await this.authorizationService.signOut();
        await this.router.navigate(['/login']);
    }

    isRegistrationEnabled(): boolean {
        return this.instanceService.isRegistrationEnabled();
    }
}
