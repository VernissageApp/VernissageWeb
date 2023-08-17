import { Component, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage implements OnInit {
    statuses?: Status[];

    constructor(private timelineService: TimelineService) {
    }

    async ngOnInit(): Promise<void> {
        this.statuses = await this.timelineService.home(0, 100);
    }
}
