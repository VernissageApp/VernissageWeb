import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy, signal, model, ChangeDetectionStrategy } from "@angular/core";
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
    animations: fadeInAnimation,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EditorsPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected statuses = signal<LinkableResult<Status> | undefined>(undefined);
    protected users = signal<LinkableResult<User> | undefined>(undefined);

    protected isReady = signal(false);
    protected tab = model('statuses');
    protected selectedTab = signal('statuses');

    protected showStatusesButton = signal(false);
    protected showUsersButton = signal(false);

    private routeParamsSubscription?: Subscription;

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

            this.tab.set(internalTab);
            this.selectedTab.set(internalTab);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    protected onSelectionChange(): void {
        const navigationExtras: NavigationExtras = {
            queryParams: { tab: this.tab() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadStatuses(): Promise<void> {
        const downloadedStatuses = await this.timelineService.featuredStatuses(undefined, undefined, undefined, undefined);
        downloadedStatuses.context = ContextTimeline.editors;

        this.statuses.set(downloadedStatuses);
    }

    private async loadUsers(): Promise<void> {
        const downloadUsers = await this.timelineService.featuredUsers(undefined, undefined, undefined, undefined);
        this.users.set(downloadUsers);
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
            this.showUsersButton.set(true);
            this.showStatusesButton.set(true);
        } else {
            if (this.settingsService.publicSettings?.showEditorsUsersChoiceForAnonymous) {
                this.showUsersButton.set(true);
            }

            if (this.settingsService.publicSettings?.showEditorsChoiceForAnonymous) {
                this.showStatusesButton.set(true);
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
