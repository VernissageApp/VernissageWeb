import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
    public user?: User | null;
    public isLoggedIn = false;
    public isReady = false;

    constructor(private authorizationService: AuthorizationService) {
    }

    async ngOnInit(): Promise<void> {
        this.user = this.authorizationService.getUser();
        this.isLoggedIn = await this.authorizationService.isLoggedIn();

        this.isReady = true;
    }
}
