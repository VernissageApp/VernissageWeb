import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { AuthorizationService } from "src/app/services/authorization/authorization.service";
import { LoadingService } from "src/app/services/common/loading.service";
import { SettingsService } from "src/app/services/http/settings.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-editors',
    templateUrl: './editors.page.html',
    styleUrls: ['./editors.page.scss'],
    animations: fadeInAnimation
})
export class EditorsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    statuses?: LinkableResult<Status>;
    isReady = false;

    routeParamsSubscription?: Subscription;

    constructor(
        private timelineService: TimelineService,
        private loadingService: LoadingService,
        private settingsService: SettingsService,
        private authorizationService: AuthorizationService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            if (!this.hasAccessToEditorsChoice()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();

            this.statuses = await this.timelineService.featured(undefined, undefined, undefined, undefined);
            this.statuses.context = ContextTimeline.editors;

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    private hasAccessToEditorsChoice(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showEditorsChoiceForAnonymous) {
            return true;
        }

        return false;
    }
}
