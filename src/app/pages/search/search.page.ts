import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, computed, model, signal, viewChild, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatSlideToggle } from '@angular/material/slide-toggle';

import { FormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatSuffix, MatHint } from '@angular/material/form-field';
import { InputActivityDirective } from '../../directives/input-activity.directive';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UsersCardComponent } from '../../components/widgets/users-card/users-card.component';
import { HashtagsSearchComponent } from '../../components/widgets/hashtags-search/hashtags-search.component';
import { StatusesSearchComponent } from '../../components/widgets/statuses-search/statuses-search.component';
import { TranslatePipe } from '@ngx-translate/core';

const searchTypes = ['users', 'hashtags', 'statuses'] as const;

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatCard, MatCardContent, MatFormField, InputActivityDirective, MatInput, MatButton, MatSuffix, MatHint, MatTabGroup, MatTab, MatSlideToggle, UsersCardComponent, HashtagsSearchComponent, StatusesSearchComponent, TranslatePipe]
})
export class SearchPage extends ResponsiveComponent implements AfterViewInit, OnInit, OnDestroy {
    private routeParamsSubscription?: Subscription;
    private searchRequestId = 0;
    private submittedQuery = signal('');
    private queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');

    protected search = model('');
    protected selectedIndex = signal(searchTypes.indexOf('statuses'));
    protected searchExecuted = signal(false);
    protected onlyCurrentUser = signal(false);
    protected showStatusFilter = computed(() => {
        if (!this.search().trim() || this.search() !== this.submittedQuery()) {
            return this.getSearchType() === 'statuses';
        }

        return searchTypes[this.selectedIndex()] === 'statuses';
    });

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

        this.routeParamsSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
            const requestId = ++this.searchRequestId;
            const query = params.get('query') ?? '';
            if (query !== this.submittedQuery()) {
                this.search.set(query);
                this.submittedQuery.set(query);
            }

            const selectedIndex = searchTypes.findIndex(type => type === params.get('type'));
            const type = searchTypes[selectedIndex] ?? (query.trim() ? 'users' : 'statuses');
            this.selectedIndex.set(searchTypes.indexOf(type));
            this.onlyCurrentUser.set(params.get('onlyCurrentUser') === 'true');

            if (!query.trim()) {
                this.searchExecuted.set(false);
                this.usersRelationships.set([]);
                this.users.set([]);
                this.hashtags.set([]);
                this.statuses.set([]);

                this.loadingService.hideLoader();
                return;
            }

            this.loadingService.showLoader();
            try {
                const searchResults = await this.searchService.search(query, type, type === 'statuses' && this.onlyCurrentUser());
                if (requestId !== this.searchRequestId) {
                    return;
                }

                const users = searchResults.users ?? [];
                const relationships = users.length > 0
                    ? await this.relationshipsService.getAll(users.map(user => user.id ?? ''))
                    : [];
                if (requestId !== this.searchRequestId) {
                    return;
                }

                this.usersRelationships.set(relationships);
                this.users.set(users);
                this.hashtags.set(searchResults.hashtags ?? []);
                this.statuses.set(searchResults.statuses ?? []);
                this.searchExecuted.set(true);
            } finally {
                if (requestId === this.searchRequestId) {
                    this.loadingService.hideLoader();
                }
            }
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
        if (event.index === this.selectedIndex()) {
            return;
        }

        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { type: searchTypes[event.index] }, queryParamsHandling: 'merge' });
    }

    protected onOnlyCurrentUserChange(onlyCurrentUser: boolean): void {
        if (this.search() !== this.submittedQuery()) {
            this.onlyCurrentUser.set(onlyCurrentUser);
            return;
        }

        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { onlyCurrentUser: onlyCurrentUser ? true : null },
            queryParamsHandling: 'merge'
        });
    }

    protected async onSubmit(): Promise<void> {
        const type = this.getSearchType();
        this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { query: this.search(), type, onlyCurrentUser: this.onlyCurrentUser() ? true : null },
            queryParamsHandling: 'merge'
        });
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
