import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { Category } from "src/app/models/category";
import { AuthorizationService } from "src/app/services/authorization/authorization.service";
import { LoadingService } from "src/app/services/common/loading.service";
import { CategoriesService } from "src/app/services/http/categories.service";
import { SettingsService } from "src/app/services/http/settings.service";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.page.html',
    styleUrls: ['./categories.page.scss'],
    animations: fadeInAnimation,
    standalone: false
})
export class CategoriesPage extends ResponsiveComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected categories = signal<Category[]>([]);

    private routeParamsSubscription?: Subscription;

    constructor(
        private categoriesService: CategoriesService,
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
            if (!this.hasAccessToCategories()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();

            const downloadedCategories = await this.categoriesService.all(true);
            this.categories.set(downloadedCategories);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    private hasAccessToCategories(): boolean {
        if (this.authorizationService.getUser()) {
            return true;
        }

        if (this.settingsService.publicSettings?.showCategoriesForAnonymous) {
            return true;
        }

        return false;
    }
}
