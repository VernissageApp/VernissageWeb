import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { BookmarksService } from 'src/app/services/http/bookmarks.service';
import { User } from 'src/app/models/user';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';

@Component({
    selector: 'app-bookmarks',
    templateUrl: './bookmarks.page.html',
    styleUrls: ['./bookmarks.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class BookmarksPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);

    protected user = signal<User | undefined>(undefined);
    protected fullName = signal('');

    private routeParamsSubscription?: Subscription;

    private bookmarksService = inject(BookmarksService);
    private loadingService = inject(LoadingService);
    private authorizationService = inject(AuthorizationService);
    private userDisplayService = inject(UserDisplayService);
    private activatedRoute = inject(ActivatedRoute);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async () => {

            this.loadingService.showLoader();

            this.user.set(this.authorizationService.getUser());
            this.fullName.set(this.userDisplayService.displayName(this.user()));

            const downloadedStatuses = await this.bookmarksService.list();
            downloadedStatuses.context = ContextTimeline.bookmarks;

            this.statuses.set(downloadedStatuses);

            this.isReady.set(true);
            this.loadingService.hideLoader();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.routeParamsSubscription?.unsubscribe();
    }
}
