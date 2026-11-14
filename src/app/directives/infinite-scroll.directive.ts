import { Directive, ElementRef, inject, input, OnDestroy, OnInit, output } from "@angular/core";
import { WindowService } from "../services/common/window.service";
import { fromEvent, Subscription, tap, throttleTime } from "rxjs";
import { MatDialog } from "@angular/material/dialog";

@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScrollDirective implements OnInit, OnDestroy {
    public scrolled = output();
  
    public infiniteScrollDistance = input(120);
    public infiniteScrollThrottle = input(120);
    public infiniteScrollEndSelector = input('');
    public infiniteScrollDisabled = input(false);
  
    private window!: Window;
    private eventSub?: Subscription;
  
    private el = inject<ElementRef<HTMLElement>>(ElementRef);
    private windowService = inject(WindowService);
    private dialog = inject(MatDialog);
  
    ngOnInit(): void {

        // Save window object for type safety.
        this.window = this.windowService.nativeWindow;

        this.eventSub = fromEvent(this.window, 'scroll').pipe(
            throttleTime(this.infiniteScrollThrottle(), undefined, { leading: true, trailing: true }),
            tap(event => this.windowScrollEvent(event))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.eventSub?.unsubscribe();
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    windowScrollEvent(_event: Event) {
        if (this.infiniteScrollDisabled()) {
            return;
        }

        // If any dialog is opened we can disable the infinite scroll.
        if (this.dialog.openDialogs && this.dialog.openDialogs.length) {
            return;
        }

        const selector = this.infiniteScrollEndSelector();
        const ends = selector ? this.el.nativeElement.querySelectorAll(selector) : [];
        const bottom = ends.length
            ? Math.min(...Array.from(ends, end => end.getBoundingClientRect().bottom))
            : this.window.document.documentElement.scrollHeight - this.window.scrollY;
        const scrollToBottom = bottom - this.window.innerHeight;

        if (scrollToBottom < this.infiniteScrollDistance()) {
            this.scrolled.emit();
        }
    }
}
