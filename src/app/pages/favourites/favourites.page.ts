import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ContextTimeline } from 'src/app/models/context-timeline';
import { FavouritesService } from 'src/app/services/http/favourites.service';
import { UserDisplayService } from 'src/app/services/common/user-display.service';
import { AuthorizationService } from 'src/app/services/authorization/authorization.service';
import { User } from 'src/app/models/user';
import { ReusableGalleryPageComponent } from 'src/app/common/reusable-gallery-page';

@Component({
    selector: 'app-favourites',
    templateUrl: './favourites.page.html',
    styleUrls: ['./favourites.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FavouritesPage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected user = signal<User | undefined>(undefined);
    protected fullName = signal('');

    private routeParamsSubscription?: Subscription;

    private favouritesService = inject(FavouritesService);
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

            const downloadedStatuses = await this.favouritesService.list();
            downloadedStatuses.context = ContextTimeline.favourites;

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
