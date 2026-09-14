import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Directive({
    selector: '[appRouteFocus]',
    host: { tabindex: '-1' }
})
export class RouteFocusDirective implements OnDestroy {
    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    private router = inject(Router);
    private currentRoutePath = this.router.navigated ? this.getRoutePath(this.router.url) : undefined;
    private routeNavigationEndSubscription: Subscription;

    constructor() {
        this.routeNavigationEndSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(event => this.onNavigationEnd(event));
    }

    ngOnDestroy(): void {
        this.routeNavigationEndSubscription.unsubscribe();
    }

    private onNavigationEnd(event: NavigationEnd): void {
        const nextRoutePath = this.getRoutePath(event.urlAfterRedirects);
        const shouldMoveFocus = this.currentRoutePath !== undefined && this.currentRoutePath !== nextRoutePath;

        this.currentRoutePath = nextRoutePath;

        if (shouldMoveFocus) {
            this.element.nativeElement.focus({ preventScroll: true });
        }
    }

    private getRoutePath(url: string): string {
        const queryOrFragmentIndex = url.search(/[?#]/);
        return queryOrFragmentIndex === -1 ? url : url.slice(0, queryOrFragmentIndex);
    }
}
