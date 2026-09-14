import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteFocusDirective } from './route-focus.directive';

describe('RouteFocusDirective', () => {
    const focus = vi.fn<(options?: FocusOptions) => void>();

    let routerEvents: Subject<NavigationEnd>;
    let router: { events: Subject<NavigationEnd>; navigated: boolean; url: string };

    beforeEach(() => {
        routerEvents = new Subject<NavigationEnd>();
        router = { events: routerEvents, navigated: false, url: '/' };
        focus.mockReset();

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: router },
                { provide: ElementRef, useValue: new ElementRef({ focus }) }
            ]
        });
    });

    it('moves focus without scrolling after navigating to a different route', () => {
        const directive = TestBed.runInInjectionContext(() => new RouteFocusDirective());

        routerEvents.next(new NavigationEnd(1, '/home?t=private', '/home?t=private'));
        routerEvents.next(new NavigationEnd(2, '/trending', '/trending'));

        expect(focus).toHaveBeenCalledOnce();
        expect(focus).toHaveBeenCalledWith({ preventScroll: true });

        directive.ngOnDestroy();
    });

    it('preserves focus when only query parameters or the fragment change', () => {
        router.navigated = true;
        router.url = '/trending?trending=statuses&period=daily';

        const directive = TestBed.runInInjectionContext(() => new RouteFocusDirective());

        routerEvents.next(new NavigationEnd(
            2,
            '/trending?trending=users&period=monthly',
            '/trending?trending=users&period=monthly#gallery'
        ));

        expect(focus).not.toHaveBeenCalled();

        directive.ngOnDestroy();
    });

    it('does not move focus during the initial navigation', () => {
        const directive = TestBed.runInInjectionContext(() => new RouteFocusDirective());

        routerEvents.next(new NavigationEnd(1, '/', '/home?t=private'));

        expect(focus).not.toHaveBeenCalled();

        directive.ngOnDestroy();
    });

    it('stops reacting to navigation after it is destroyed', () => {
        const directive = TestBed.runInInjectionContext(() => new RouteFocusDirective());

        routerEvents.next(new NavigationEnd(1, '/', '/home'));
        directive.ngOnDestroy();
        routerEvents.next(new NavigationEnd(2, '/trending', '/trending'));

        expect(focus).not.toHaveBeenCalled();
    });
});
