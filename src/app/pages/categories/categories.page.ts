import { BreakpointObserver } from "@angular/cdk/layout";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { Responsive } from "src/app/common/responsive";
import { Category } from "src/app/models/category";
import { LinkableResult } from "src/app/models/linkable-result";
import { Status } from "src/app/models/status";
import { LoadingService } from "src/app/services/common/loading.service";
import { CategoriesService } from "src/app/services/http/categories.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-categories',
    templateUrl: './categories.page.html',
    styleUrls: ['./categories.page.scss'],
    animations: fadeInAnimation
})
export class CategoriesPage extends Responsive {
    isReady = true;

    categories: Category[] = [];
    categoryStatuses = new Map<string, LinkableResult<Status>>();

    routeParamsSubscription?: Subscription;

    constructor(
        private timelineService: TimelineService,
        private categoriesService: CategoriesService,
        private loadingService: LoadingService,
        private activatedRoute: ActivatedRoute,
        breakpointObserver: BreakpointObserver) {
            super(breakpointObserver);
    }

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async (params) => {
            this.loadingService.showLoader();

            const categories = await this.categoriesService.all();
            for(let category of categories) {
                const statuses = await this.timelineService.category(undefined, undefined, undefined, undefined, category.name);
                if (statuses.data.length) {
                    this.categoryStatuses.set(category?.name ?? '', statuses);
                    this.categories.push(category);
                }
            }

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }
}
