import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { User } from "src/app/models/user";
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
    users?: LinkableResult<User>;
    isReady = false;

    tab = 'statuses';
    selectedTab = 'statuses';

    showStatusesButton = false;
    showUsersButton = false;

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
        this.calculateButtonVisibility();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            if (!this.hasAccessToEditorsChoice()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();
            const internalTab  = params['tab'] as string ?? this.getDefaultTab();

            switch(internalTab) {
                case 'statuses':
                    await this.loadStatuses();
                    break;
                case 'users':
                    await this.loadUsers();
                    break;
            }

            this.tab  = internalTab;
            this.selectedTab = internalTab;

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    private async loadStatuses(): Promise<void> {
        this.statuses = await this.timelineService.featuredStatuses(undefined, undefined, undefined, undefined);
        this.statuses.context = ContextTimeline.editors;
    }

    private async loadUsers(): Promise<void> {
        this.users = await this.timelineService.featuredUsers(undefined, undefined, undefined, undefined);
    }

    onSelectionChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { tab: this.tab },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private hasAccessToEditorsChoice(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showEditorsChoiceForAnonymous || this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous) {
            return true;
        }

        return false;
    }

    private calculateButtonVisibility(): void {
        if (this.authorizationService.getUser()) {
            this.showUsersButton = true;
            this.showStatusesButton = true;
        } else {
            if (this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous) {
                this.showUsersButton = true;
            }

            if (this.settingsService.publicSettings?.showEditorsChoiceForAnonymous) {
                this.showStatusesButton = true;
            }
        }
    }

    private getDefaultTab(): string {
        if (this.authorizationService.getUser()) {
            return 'statuses';
        }

        if (this.settingsService.publicSettings?.showEditorsChoiceForAnonymous) {
            return 'statuses';
        }

        if (this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous) {
            return 'users';
        }

        return 'statuses';
    }
}
