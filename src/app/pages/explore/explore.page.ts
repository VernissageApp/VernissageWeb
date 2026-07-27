import { ChangeDetectionStrategy, Component, computed, inject, model, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from "rxjs";
import { ReusableGalleryPageComponent } from "src/app/common/reusable-gallery-page";
import { InputActivityDirective } from 'src/app/directives/input-activity.directive';
import { Camera } from 'src/app/models/camera';
import { Category } from "src/app/models/category";
import { ExploreType } from 'src/app/models/explore-type';
import { Film } from 'src/app/models/film';
import { Lens } from 'src/app/models/lens';
import { AuthorizationService } from "src/app/services/authorization/authorization.service";
import { LoadingService } from "src/app/services/common/loading.service";
import { CamerasService } from 'src/app/services/http/cameras.service';
import { CategoriesService } from "src/app/services/http/categories.service";
import { FilmsService } from 'src/app/services/http/films.service';
import { LensesService } from 'src/app/services/http/lenses.service';
import { SettingsService } from "src/app/services/http/settings.service";
import { CameraGalleryComponent } from '../../components/widgets/camera-gallery/camera-gallery.component';
import { CategoryGalleryComponent } from "../../components/widgets/category-gallery/category-gallery.component";
import { FilmGalleryComponent } from '../../components/widgets/film-gallery/film-gallery.component';
import { LensGalleryComponent } from '../../components/widgets/lens-gallery/lens-gallery.component';

@Component({
    selector: 'app-explore',
    templateUrl: './explore.page.html',
    styleUrls: ['./explore.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonToggleGroup, MatButtonToggle, MatFormField, MatLabel, InputActivityDirective, MatInput, MatIcon, FormsModule, CategoryGalleryComponent, CameraGalleryComponent, LensGalleryComponent, FilmGalleryComponent, TranslatePipe]
})
export class ExplorePage extends ReusableGalleryPageComponent implements OnInit, OnDestroy {
    protected isReady = signal(false);
    protected categories = signal<Category[] | undefined>(undefined);
    protected cameras = signal<Camera[] | undefined>(undefined);
    protected lenses = signal<Lens[] | undefined>(undefined);
    protected films = signal<Film[] | undefined>(undefined);
    protected explore = model<ExploreType>('categories');
    protected filterText = model('');
    protected selectedExplore = signal<ExploreType>('categories');
    protected showCategories = signal(false);
    protected showCameras = signal(false);
    protected showLenses = signal(false);
    protected showFilms = signal(false);
    protected filteredCategories = computed(() => this.filterByName(this.categories()));
    protected filteredCameras = computed(() => this.filterByName(this.cameras()));
    protected filteredLenses = computed(() => this.filterByName(this.lenses()));
    protected filteredFilms = computed(() => this.filterByName(this.films()));

    private routeParamsSubscription?: Subscription;
    private readonly metadataPageSize = 100;

    private categoriesService = inject(CategoriesService);
    private camerasService = inject(CamerasService);
    private lensesService = inject(LensesService);
    private filmsService = inject(FilmsService);
    private loadingService = inject(LoadingService);
    private settingsService = inject(SettingsService);
    private authorizationService = inject(AuthorizationService);
    private activatedRoute = inject(ActivatedRoute);

    override async ngOnInit(): Promise<void> {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.updateVisibility();

            if (!this.hasAccessToExplore()) {
                await this.router.navigate(['/login']);
                return;
            }

            this.loadingService.showLoader();
            const exploreType = this.resolveExploreType(params['type'] as string | undefined);
            this.explore.set(exploreType);
            this.selectedExplore.set(exploreType);
            await this.loadExploreType(exploreType);

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
            queryParams: { type: this.explore() },
            queryParamsHandling: 'merge'
        };

        this.router.navigate([], navigationExtras);
    }

    private async loadExploreType(exploreType: ExploreType): Promise<void> {
        switch (exploreType) {
            case 'categories':
                if (!this.categories()) {
                    this.categories.set(await this.categoriesService.all(true));
                }
                break;
            case 'cameras':
                if (!this.cameras()) {
                    const camerasPage = await this.camerasService.get(1, this.metadataPageSize);
                    this.cameras.set(camerasPage.data);
                }
                break;
            case 'lenses':
                if (!this.lenses()) {
                    const lensesPage = await this.lensesService.get(1, this.metadataPageSize);
                    this.lenses.set(lensesPage.data);
                }
                break;
            case 'films':
                if (!this.films()) {
                    const filmsPage = await this.filmsService.get(1, this.metadataPageSize);
                    this.films.set(filmsPage.data);
                }
                break;
        }
    }

    private updateVisibility(): void {
        const isLoggedIn = !!this.authorizationService.getUser();
        this.showCategories.set(isLoggedIn || (this.settingsService.publicSettings?.showCategoriesForAnonymous ?? false));
        this.showCameras.set(isLoggedIn || (this.settingsService.publicSettings?.showCamerasForAnonymous ?? false));
        this.showLenses.set(isLoggedIn || (this.settingsService.publicSettings?.showLensesForAnonymous ?? false));
        this.showFilms.set(isLoggedIn || (this.settingsService.publicSettings?.showFilmsForAnonymous ?? false));
    }

    private hasAccessToExplore(): boolean {
        return this.showCategories() || this.showCameras() || this.showLenses() || this.showFilms();
    }

    private resolveExploreType(requestedType?: string): ExploreType {
        if (requestedType === 'categories' && this.showCategories()) {
            return requestedType;
        }

        if (requestedType === 'cameras' && this.showCameras()) {
            return requestedType;
        }

        if (requestedType === 'lenses' && this.showLenses()) {
            return requestedType;
        }

        if (requestedType === 'films' && this.showFilms()) {
            return requestedType;
        }

        if (this.showCategories()) {
            return 'categories';
        }

        if (this.showCameras()) {
            return 'cameras';
        }

        if (this.showLenses()) {
            return 'lenses';
        }

        return 'films';
    }

    private filterByName<T extends { name: string }>(items?: T[]): T[] | undefined {
        const normalizedFilter = this.filterText().trim().toLocaleLowerCase();
        if (!items || !normalizedFilter) {
            return items;
        }

        return items.filter(item => item.name.toLocaleLowerCase().includes(normalizedFilter));
    }
}
