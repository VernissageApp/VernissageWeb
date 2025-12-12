import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, model, signal, viewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { SearchService } from 'src/app/services/http/search.service';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { Hashtag } from 'src/app/models/hashtag';
import { Status } from 'src/app/models/status';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SearchPage extends ResponsiveComponent implements AfterViewInit, OnInit, OnDestroy {
    private routeParamsSubscription?: Subscription;
    private queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');

    protected search = model('');
    protected selectedIndex = signal(0);
    protected searchExecuted = signal(false);

    protected users = signal<User[]>([]);
    protected hashtags = signal<Hashtag[]>([]);
    protected statuses = signal<Status[]>([]);
    protected usersRelationships = signal<Relationship[]>([]);

    private searchService = inject(SearchService);
    private relationshipsService = inject(RelationshipsService);
    private activatedRoute = inject(ActivatedRoute);
    private loadingService = inject(LoadingService);
    private router = inject(Router);

    override ngOnInit(): void {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const type = params['type'];
            this.search.set(params['query']);

            if (!this.search) {
                this.searchExecuted.set(false);
            }

            if ((this.search()?.trim().length ?? 0) === 0) {
                this.usersRelationships.set([]);
                this.users.set([]);
                this.hashtags.set([]);
                this.statuses.set([]);

                this.loadingService.hideLoader();
                return;
            }

            switch (type) {
                case 'users':
                    this.selectedIndex.set(0);
                    break;
                case 'hashtags':
                    this.selectedIndex.set(1);
                    break;
                case 'statuses':
                    this.selectedIndex.set(2);
                    break;
            }

            const searchResults = await this.searchService.search(this.search(), type);

            if (searchResults.users && searchResults.users.length !== 0) {                
                const relationships = await this.relationshipsService.getAll(searchResults.users?.map(x => x.id ?? ''));
                this.usersRelationships.set(relationships);
            }
    
            this.users.set(searchResults.users ?? []);
            this.hashtags.set(searchResults.hashtags ?? []);
            this.statuses.set(searchResults.statuses ?? []);

            this.searchExecuted.set(true);
            this.loadingService.hideLoader();
        });
    }

    ngAfterViewInit(): void {
        this.queryInput()?.nativeElement.focus();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    protected onSelectedTabChange(event: MatTabChangeEvent): void {
        let selectedType = '';
        switch (event.index) {
            case 0: 
                selectedType = 'users';
                break;
            case 1:
                selectedType = 'hashtags';
                break;
            case 2:
                selectedType = 'statuses';
                break;
        }

        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query: this.search(), type: selectedType }, queryParamsHandling: 'merge' });
    }

    protected async onSubmit(): Promise<void> {
        const type = this.getSearchType();
        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query: this.search(), type: type }, queryParamsHandling: 'merge' });
    }

    private getSearchType(): string {
        if (this.search()?.startsWith('#')) {
            return 'hashtags';
        }

        if (this.search()?.includes('@')) {
            return 'users';
        }

        return 'statuses';
    }
}
