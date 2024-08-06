import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { Category } from "src/app/models/category";
import { LoadingService } from "src/app/services/common/loading.service";
import { CategoriesService } from "src/app/services/http/categories.service";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.page.html',
    styleUrls: ['./categories.page.scss'],
    animations: fadeInAnimation
})
export class CategoriesPage extends ResponsiveComponent implements OnInit, OnDestroy {
    isReady = false;
    categories?: Category[] = [];
    routeParamsSubscription?: Subscription;

    constructor(
        private categoriesService: CategoriesService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {
            this.loadingService.showLoader();

            this.categories = await this.categoriesService.all(true);
            this.isReady = true;

            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }
}
