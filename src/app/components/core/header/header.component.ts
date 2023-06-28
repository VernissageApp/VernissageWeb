import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user';
import { AuthorizationService } from '../../../services/authorization/authorization.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

    public user?: User | null;
    private userChangeSubscription?: Subscription;

    constructor(
        private authorizationService: AuthorizationService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.user = this.authorizationService.getUser();
        this.userChangeSubscription = this.authorizationService.changes.subscribe(user => {
            this.user = user;
        });
    }

    ngOnDestroy(): void {
        this.userChangeSubscription?.unsubscribe();
    }

    async signOut(): Promise<void> {
        await this.authorizationService.signOut();
        await this.router.navigate(['/login']);
    }
}
