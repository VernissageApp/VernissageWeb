import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoutingStateService {
    private history: string[] = [];

    constructor(private router: Router) {
    }

    public startRoutingListener(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))  
            .subscribe(async (event) => {
                const navigationEndEvent = event as NavigationEnd;
                if (navigationEndEvent.urlAfterRedirects) {
                    this.history.push(navigationEndEvent.urlAfterRedirects);

                    if (this.history.length >= 10) {
                        this.history.shift();
                    }
                }
            });
    }

    public getHistory(): string[] {
        return this.history;
    }
    
    public getPreviousUrl(): string | undefined {
        return this.history[this.history.length - 2] || undefined;
    }
}