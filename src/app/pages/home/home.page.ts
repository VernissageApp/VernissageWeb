import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage implements OnInit {
    statuses?: Status[];
    timeline: String = "home";

    constructor(private authorizationService: AuthorizationService, private timelineService: TimelineService) {
    }

    async ngOnInit(): Promise<void> {
        if (this.authorizationService.isLoggedIn()) {
            this.statuses = await this.timelineService.home();
        } else {
            this.statuses = await this.timelineService.public();
        }
    }
}
