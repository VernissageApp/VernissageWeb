
import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject, DOCUMENT } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { ReusableGalleryPageComponent } from "src/app/common/reusable-gallery-page";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LoadingService } from "src/app/services/common/loading.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-category',
    templateUrl: './category.page.html',
    styleUrls: ['./category.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected category = signal('');

    private routeParamsSubscription?: Subscription;

    private document = inject(DOCUMENT);
    private timelineService = inject(TimelineService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async (params) => {
            this.loadingService.showLoader();
            this.category.set(params['category'] as string);

            this.statuses.set(undefined);
            await this.loadFirstStatusesSet();
            this.setFeedLinks();

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.removeFeedLinks();
        this.routeParamsSubscription?.unsubscribe();
    }

    private async loadFirstStatusesSet(): Promise<void> {
        const downloadedStatuses = await this.timelineService.category(this.category(), undefined, undefined, undefined, undefined);
        downloadedStatuses.context = ContextTimeline.category;
        downloadedStatuses.category = this.category();

        this.statuses.set(downloadedStatuses);
    }

    private setFeedLinks(): void {
        const existingRssLink = this.document.querySelector('link[id="rssCategoryLink"]');
        if (existingRssLink) {
            existingRssLink.setAttribute('title', `Category ${this.category()} feed (RSS)`);
            existingRssLink.setAttribute('href', '/rss/categories/' + this.category());
        } else {
            const newRssFeed: HTMLLinkElement = this.document.createElement('link');
            newRssFeed.setAttribute('rel', 'alternate');
            newRssFeed.setAttribute('id', 'rssCategoryLink');
            newRssFeed.setAttribute('type', 'application/rss+xml');
            newRssFeed.setAttribute('title', `Category ${this.category()} feed (RSS)`);
            newRssFeed.setAttribute( 'href', '/rss/categories/' + this.category());
            this.document.head.appendChild(newRssFeed);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomCategoryLink"]');
        if (existingAtomLink) {
            existingAtomLink.setAttribute('title', `Category ${this.category()} feed (Atom)`);
            existingAtomLink.setAttribute('href', '/atom/categories/' + this.category());
        } else {
            const newAtomFeed: HTMLLinkElement = this.document.createElement('link');
            newAtomFeed.setAttribute('rel', 'alternate');
            newAtomFeed.setAttribute('id', 'atomCategoryLink');
            newAtomFeed.setAttribute('type', 'application/atom+xml');
            newAtomFeed.setAttribute('title', `Category ${this.category()} feed (Atom)`);
            newAtomFeed.setAttribute( 'href', '/atom/categories/' + this.category());
            this.document.head.appendChild(newAtomFeed);
        }
    }

    private removeFeedLinks(): void {
        const existingRssLink = this.document.querySelector('link[id="rssCategoryLink"]');
        if (existingRssLink) {
            this.document.head.removeChild(existingRssLink);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomCategoryLink"]');
        if (existingAtomLink) {
            this.document.head.removeChild(existingAtomLink);
        }
    }
}
