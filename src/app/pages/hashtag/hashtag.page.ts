
import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject, DOCUMENT } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/internal/Subscription";
import { ReusableGalleryPageComponent } from "src/app/common/reusable-gallery-page";
import { ContextTimeline } from "src/app/models/context-timeline";
import { LoadingService } from "src/app/services/common/loading.service";
import { TimelineService } from "src/app/services/http/timeline.service";

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.page.html',
    styleUrls: ['./hashtag.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HashtagPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected hashtag = signal('');

    private routeParamsSubscription?: Subscription;

    private document = inject(DOCUMENT);
    private timelineService = inject(TimelineService);
    private loadingService = inject(LoadingService);
    private activatedRoute = inject(ActivatedRoute);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.params.subscribe(async (params) => {
            this.loadingService.showLoader();
            this.hashtag.set(params['tag'] as string);

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
        const downloadStatuses = await this.timelineService.hashtag(this.hashtag(), undefined, undefined, undefined, undefined);
        downloadStatuses.context = ContextTimeline.hashtag;
        downloadStatuses.hashtag = this.hashtag();

        this.statuses.set(downloadStatuses);
    }

    private setFeedLinks(): void {
        const existingRssLink = this.document.querySelector('link[id="rssHashtagLink"]');
        if (existingRssLink) {
            existingRssLink.setAttribute('title', `Hashtag ${this.hashtag()} feed (RSS)`);
            existingRssLink.setAttribute('href', '/rss/hashtags/' + this.hashtag());
        } else {
            const newRssLink: HTMLLinkElement = this.document.createElement('link');
            newRssLink.setAttribute('rel', 'alternate');
            newRssLink.setAttribute('id', 'rssHashtagLink');
            newRssLink.setAttribute('type', 'application/rss+xml');
            newRssLink.setAttribute('title', `Category ${this.hashtag()} feed (RSS)`);
            newRssLink.setAttribute( 'href', '/rss/hashtags/' + this.hashtag());
            this.document.head.appendChild(newRssLink);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomHashtagLink"]');
        if (existingAtomLink) {
            existingAtomLink.setAttribute('title', `Hashtag ${this.hashtag()} feed (Atom)`);
            existingAtomLink.setAttribute('href', '/atom/hashtags/' + this.hashtag());
        } else {
            const nwwAtomLink: HTMLLinkElement = this.document.createElement('link');
            nwwAtomLink.setAttribute('rel', 'alternate');
            nwwAtomLink.setAttribute('id', 'atomHashtagLink');
            nwwAtomLink.setAttribute('type', 'application/atom+xml');
            nwwAtomLink.setAttribute('title', `Category ${this.hashtag()} feed (Atom)`);
            nwwAtomLink.setAttribute( 'href', '/atom/hashtags/' + this.hashtag());
            this.document.head.appendChild(nwwAtomLink);
        }
    }

    private removeFeedLinks(): void {
        const existingRssLink = this.document.querySelector('link[id="rssHashtagLink"]');
        if (existingRssLink) {
            this.document.head.removeChild(existingRssLink);
        }

        const existingAtomLink = this.document.querySelector('link[id="atomHashtagLink"]');
        if (existingAtomLink) {
            this.document.head.removeChild(existingAtomLink);
        }
    }
}
