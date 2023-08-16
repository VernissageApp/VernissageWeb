import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fadeInAnimation } from "../../animations/fade-in.animation";
import { User } from 'src/app/models/user';
import { Relationship } from 'src/app/models/relationship';
import { SearchService } from 'src/app/services/http/search.service';
import { RelationshipsService } from 'src/app/services/http/relationships.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/common/loading.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
    animations: fadeInAnimation
})
export class SearchPage implements OnInit, OnDestroy, AfterViewInit {
    search = '';
    users: User[] = [];
    usersRelationships: Relationship[] = [];
    routeParamsSubscription?: Subscription;
    searchExecuted = false;

    @ViewChild('queryInput') queryInput?: ElementRef;

    constructor(
        private searchService: SearchService,
        private relationshipsService: RelationshipsService,
        private activatedRoute: ActivatedRoute,
        private loadingService: LoadingService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.routeParamsSubscription = this.activatedRoute.queryParams.subscribe(async params => {
            this.loadingService.showLoader();

            const query = params['query'];
            this.search = query;

            if (!query) {
                this.searchExecuted = false;
            }

            if ((this.search?.trim().length ?? 0) === 0) {
                this.usersRelationships = [];
                this.users = [];
                this.loadingService.hideLoader();

                return;
            }

            const searchResults = await this.searchService.search(this.search);
            if (searchResults.users && searchResults.users.length !== 0) {                
                this.usersRelationships = await this.relationshipsService.getAll(searchResults.users?.map(x => x.id ?? ''))
            }
    
            this.users = searchResults.users ?? [];

            this.searchExecuted = true;
            this.loadingService.hideLoader();
        });
    }

    ngAfterViewInit(): void {
        this.queryInput?.nativeElement.focus();
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription?.unsubscribe();
    }

    async onSubmit(): Promise<void> {
        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { query: this.search }, queryParamsHandling: 'merge' });
    }
}
