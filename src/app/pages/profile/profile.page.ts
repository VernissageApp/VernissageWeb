import { Component } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage {
    user?: User;

    constructor(private authorizationService: AuthorizationService, private usersService: UsersService) {
    }

    async ngOnInit(): Promise<void> {
        const userFromToken = this.authorizationService.getUser();
        this.user = await this.usersService.profile(userFromToken?.userName ?? '');
    }
}
