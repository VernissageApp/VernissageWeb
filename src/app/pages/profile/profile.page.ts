import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Status } from 'src/app/models/status';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { StatusesService } from 'src/app/services/http/statuses.service';
import { UsersService } from 'src/app/services/http/users.service';
import { fadeInAnimation } from "../../animations/fade-in.animation";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    animations: fadeInAnimation
})
export class ProfilePage implements OnInit, OnDestroy {
    user?: User;
    statuses?: Status[];
    routeParamsSubscription?: Subscription;

    gallery?: Status[][];
    readonly columns = 3;

    constructor(
        private authorizationService: AuthorizationService,
        private usersService: UsersService,
        private statusesService: StatusesService,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {
        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async params => {
            const userName = params['userName'];

            this.user = await this.usersService.profile(userName);
            this.statuses = await this.statusesService.get();
            this.buildGallery();
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    getMainAttachmentSrc(status: Status): string {
        if (!status.attachments) {
            return '';
        }

        if (status.attachments?.length === 0) {
            return '';
        }

        return status.attachments[0].originalFile?.url ?? '';
    }

    private buildGallery(): void {
        this.gallery = [];

        for(let i = 0; i < this.columns; i++) {
            this.gallery?.push([]);
        }

        if (!this.statuses) {
            return;
        }

        let currentColumn = 0;
        for (let status of this.statuses) {
            this.gallery[currentColumn].push(status);
            currentColumn = (currentColumn + 1) % this.columns;
        }

        console.log(this.gallery);
    }
}
