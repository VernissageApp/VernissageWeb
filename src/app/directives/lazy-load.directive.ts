import { AfterViewInit, Directive, ElementRef, OnDestroy, output } from '@angular/core';

@Directive({
    selector: '[appLazyLoad]',
    standalone: false
})
export class LazyLoadDirective implements AfterViewInit, OnDestroy {
    public lazyLoad = output<boolean>();

    private intersectionObserver?: IntersectionObserver;

    constructor(private element: ElementRef) { }

    ngAfterViewInit(): void {
        this.intersectionObserver?.disconnect();
        this.initIntersectionObserver();
    }

    ngOnDestroy(): void {
        this.intersectionObserver?.disconnect();
    }

    private initIntersectionObserver(): void {
        const options: IntersectionObserverInit = {
            root: null, // observing for viewport
            rootMargin: '0px',
            threshold: 0 // Triggers when some % of the element is visible
        };

        this.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.lazyLoad.emit(true);
                    this.intersectionObserver?.unobserve(this.element.nativeElement); // unobserve after first trigger
                }
            });
        }, options);

        this.intersectionObserver?.observe(this.element.nativeElement);
    }
}