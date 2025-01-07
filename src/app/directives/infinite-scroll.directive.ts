import { Directive, ElementRef, input, OnDestroy, OnInit, output } from "@angular/core";
import { WindowService } from "../services/common/window.service";
import { fromEvent, Subscription, tap, throttleTime } from "rxjs";
import { RandomGeneratorService } from "../services/common/random-generator.service";
import { LazyLoaderService } from "../services/common/lazy-loader.service";

@Directive({
    selector: '[appInfiniteScroll]',
    standalone: false
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
    public scrolled = output();
  
    public infiniteScrollDistance = input(120);
    public infiniteScrollThrottle = input(120);
    public infiniteScrollDisabled = input(false);
  
    private window!: Window;
    private controlId!: string;
    private eventSub?: Subscription;
  
    constructor(
        private el: ElementRef,
        private windowService: WindowService,
        private random: RandomGeneratorService,
        private lazyLoaderService: LazyLoaderService
    ) { }
  
    ngOnInit(): void {
        this.controlId = this.random.generateString(10);
        this.lazyLoaderService.loaderId.set(this.controlId);

        // Save window object for type safety.
        this.window = this.windowService.nativeWindow;

        this.eventSub = fromEvent(window, 'scroll').pipe(
            throttleTime(this.infiniteScrollThrottle()),
            tap(event => this.windowScrollEvent(event))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.eventSub?.unsubscribe();
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    windowScrollEvent(_event: Event) {
        if (this.controlId !== this.lazyLoaderService.loaderId()) {
            return;
        }

        if (this.infiniteScrollDisabled()) {
            return;
        }

        // height of whole window page
        const heightOfWholePage = this.window.document.documentElement.scrollHeight;
  
        // how big in pixels the element is
        const heightOfElement = this.el.nativeElement.scrollHeight;
  
        // currently scrolled Y position
        const currentScrolledY = this.window.scrollY;
  
        // height of opened window - shrinks if console is opened
        const innerHeight = this.window.innerHeight;
  
        /**
         * the area between the start of the page and when this element is visible
         * in the parent component
         */
        const spaceOfElementAndPage = heightOfWholePage - heightOfElement;
  
        // calculated whether we are near the end
        const scrollToBottom =
        heightOfElement - innerHeight - currentScrolledY + spaceOfElementAndPage;
  
        // if the user is near end
        if (scrollToBottom < this.infiniteScrollDistance()) {
            this.scrolled.emit();
        }
    }
}
