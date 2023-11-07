import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { Status } from 'src/app/models/status';
import { TimelineService } from 'src/app/services/http/timeline.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    animations: fadeInAnimation
})
export class HomePage implements OnInit, OnDestroy {
    statuses?: Status[];
    timeline: String = 'private';
    routeParamsSubscription?: Subscription;
    isReady = false;

    constructor(
        private authorizationService: AuthorizationService,
        private timelineService: TimelineService,
        private router: Router,
        private activatedRoute: ActivatedRoute) {
    }

    async ngOnInit(): Promise<void> {
        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            const pageType = params['t'] as string;
            switch(pageType) {
                case 'local':
                    this.timeline = 'local';
                    this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    break;
                case 'global':
                    this.timeline = 'global';
                    this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, false);
                    break;
                default:
                    if (this.isLoggedIn()) {
                        this.timeline = 'private';
                        this.statuses = await this.timelineService.home();
                    } else {
                        this.timeline = 'local';
                        this.statuses = await this.timelineService.public(undefined, undefined, undefined, undefined, true);
                    }
                    break;
            }

            this.isReady = true;
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    onTimelineChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { t: this.timeline },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    isLoggedIn(): Boolean {
        return this.authorizationService.isLoggedIn();
    }
}
