import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { WindowService } from "../services/common/window.service";
import { fromEvent, tap, throttleTime } from "rxjs";

@Directive({
    selector: '[appInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit {
    @Output() scrolled: EventEmitter<void> = new EventEmitter<void>();
  
    @Input() infiniteScrollDistance = 120;
    @Input() infiniteScrollThrottle = 120;
    @Input() infiniteScrollDisabled = false;
  
    private window!: Window;
    eventSub: any;
  
    constructor(private el: ElementRef, private windowService: WindowService) { }
  
    ngOnInit(): void {
        // Save window object for type safety.
        this.window = this.windowService.nativeWindow;

        this.eventSub = fromEvent(window, 'scroll').pipe(
            throttleTime(this.infiniteScrollThrottle),
            tap(event => this.windowScrollEvent(event))
        ).subscribe();
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    windowScrollEvent(_event: Event) {
        if (this.infiniteScrollDisabled) {
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
        if (scrollToBottom < this.infiniteScrollDistance) {
            this.scrolled.emit();
        }
    }
}
