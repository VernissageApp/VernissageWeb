import { BreakpointObserver } from "@angular/cdk/layout";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInAnimation } from "src/app/animations/fade-in.animation";
import { ResponsiveComponent } from "src/app/common/responsive";
import { Category } from "src/app/models/category";
import { ContextTimeline } from "src/app/models/context-timeline";
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
export class CategoriesPage extends ResponsiveComponent implements OnInit, OnDestroy {
    private readonly numberOfVisibleStatuses = 10;

    isReady = false;
    categories: Category[] = [];
    categoryStatuses = new Map<string, LinkableResult<Status>>();

    routeParamsSubscription?: Subscription;

    constructor(
        private timelineService: TimelineService,
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

            const internalAllCategories = await this.categoriesService.all();

            const internalCategories: Category[] = [];
            const internalCategoryStatuses = new Map<string, LinkableResult<Status>>();

            await Promise.all(internalAllCategories.map(async (category) => {
                const statuses = await this.loadStatuses(category);
                if (statuses.data.length) {
                    internalCategoryStatuses.set(category.name, statuses);
                    internalCategories.push(category);
                }
            }));

            this.categoryStatuses = internalCategoryStatuses;
            this.categories = internalCategories;

            this.isReady = true;
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    private async loadStatuses(category: Category): Promise<LinkableResult<Status>> {
        const statuses = await this.timelineService.category(category.name, undefined, undefined, undefined, this.numberOfVisibleStatuses, undefined);
        statuses.context = ContextTimeline.category;
        statuses.category = category.name;

        return statuses
    }
}
