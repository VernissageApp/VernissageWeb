import { ViewportScroller } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router, Scroll } from '@angular/router';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContextStatusesService } from '../services/common/context-statuses.service';
import { ReusableGalleryPageComponent } from './reusable-gallery-page';

describe('ReusableGalleryPageComponent', () => {
    const getScrollPosition = vi.fn<() => [number, number]>();
    const scrollToPosition = vi.fn<(position: [number, number]) => void>();

    let component: ReusableGalleryPageComponent;
    let routerEvents: Subject<NavigationStart | NavigationEnd | Scroll>;

    beforeEach(() => {
        routerEvents = new Subject<NavigationStart | NavigationEnd | Scroll>();
        getScrollPosition.mockReset();
        scrollToPosition.mockReset();

        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: {
                        events: routerEvents,
                        routerState: { snapshot: { url: '/home?t=private' } }
                    }
                },
                {
                    provide: ViewportScroller,
                    useValue: { getScrollPosition, scrollToPosition }
                },
                {
                    provide: ContextStatusesService,
                    useValue: { statuses: undefined, setContextStatuses: vi.fn() }
                },
                {
                    provide: BreakpointObserver,
                    useValue: {
                        observe: vi.fn(() => of({ matches: false })),
                        isMatched: vi.fn(() => false)
                    }
                }
            ]
        });

        component = TestBed.runInInjectionContext(() => new ReusableGalleryPageComponent());
        component.ngOnInit();
    });

    it('restores the saved scroll position after a popstate return to a reused gallery', () => {
        getScrollPosition.mockReturnValue([0, 2400]);

        routerEvents.next(new NavigationStart(1, '/statuses/123', 'imperative'));
        routerEvents.next(new NavigationEnd(1, '/statuses/123', '/statuses/123'));
        routerEvents.next(new NavigationStart(2, '/home?t=private', 'popstate', { navigationId: 1 }));
        routerEvents.next(new NavigationEnd(2, '/home?t=private', '/home?t=private'));
        routerEvents.next(new Scroll(
            new NavigationEnd(2, '/home?t=private', '/home?t=private'),
            null,
            null
        ));

        expect(scrollToPosition).toHaveBeenCalledOnce();
        expect(scrollToPosition).toHaveBeenCalledWith([0, 2400]);
    });

    it('does not restore an old position during imperative navigation', () => {
        getScrollPosition.mockReturnValue([0, 2400]);

        routerEvents.next(new NavigationStart(1, '/statuses/123', 'imperative'));
        routerEvents.next(new NavigationEnd(1, '/statuses/123', '/statuses/123'));
        routerEvents.next(new NavigationStart(2, '/home?t=private', 'imperative'));
        routerEvents.next(new NavigationEnd(2, '/home?t=private', '/home?t=private'));
        routerEvents.next(new Scroll(
            new NavigationEnd(2, '/home?t=private', '/home?t=private'),
            null,
            null
        ));

        expect(scrollToPosition).not.toHaveBeenCalled();
    });
});
