import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { User } from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { SearchService } from 'src/app/services/http/search.service';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';
import { ResponsiveComponent } from 'src/app/common/responsive';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Hashtag } from 'src/app/models/hashtag';
import { Status } from 'src/app/models/status';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
    animations: fadeInAnimation
})
export class SearchPage extends ResponsiveComponent implements AfterViewInit, OnInit, OnDestroy {
    search = '';
    type = 'users'

    selectedIndex = 0;
    users: User[] = [];
    hashtags: Hashtag[] = [];
    statuses: Status[] = [];

    usersRelationships: Relationship[] = [];
    routeParamsSubscription?: Subscription;
    searchExecuted = false;

    @ViewChild('queryInput') queryInput?: ElementRef;

    constructor(
        private searchService: SearchService,
        private relationshipsService: RelationshipsService,
        private activatedRoute: ActivatedRoute,
        private loadingService: LoadingService,
        private router: Router,
        breakpointObserver: BreakpointObserver
    ) {
        super(breakpointObserver);
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            this.type = params['type'];
            this.search = params['query'];

            if (!this.search) {
                this.searchExecuted = false;
            }

            if ((this.search?.trim().length ?? 0) === 0) {
                this.usersRelationships = [];
                this.users = [];
                this.hashtags = [];
                this.statuses = [];

                this.loadingService.hideLoader();
                return;
            }

            switch (this.type) {
                case 'users':
                    this.selectedIndex = 0;
                    break;
                case 'hashtags':
                    this.selectedIndex = 1;
                    break;
                case 'statuses':
                    this.selectedIndex = 2;
                    break;
            }

            const searchResults = await this.searchService.search(this.search, this.type);

            if (searchResults.users && searchResults.users.length !== 0) {                
                this.usersRelationships = await this.relationshipsService.getAll(searchResults.users?.map(x => x.id ?? ''))
            }
    
            this.users = searchResults.users ?? [];
            this.hashtags = searchResults.hashtags ?? [];
            this.statuses = searchResults.statuses ?? [];

            this.searchExecuted = true;
            this.loadingService.hideLoader();
        });
    }

    ngAfterViewInit(): void {
        this.queryInput?.nativeElement.focus();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.routeParamsSubscription?.unsubscribe();
    }

    getMainStatus(status: Status): Status {
        return status.reblog ?? status;
    }

    onSelectedTabChange(event: MatTabChangeEvent): void {
        console.log(event);
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

        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query: this.search, type: selectedType }, queryParamsHandling: 'merge' });
    }

    async onSubmit(): Promise<void> {
        const type = this.getSearchType();
        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query: this.search, type: type }, queryParamsHandling: 'merge' });
    }

    private getSearchType(): string {
        if (this.search.startsWith('#')) {
            return 'hashtags';
        }

        if (this.search.includes('@')) {
            return 'users';
        }

        return 'statuses';
    }
}
