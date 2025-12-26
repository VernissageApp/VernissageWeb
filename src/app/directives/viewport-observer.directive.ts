import { AfterViewInit, Directive, ElementRef, effect, inject, input, OnDestroy, output } from '@angular/core';

interface ObserverBucket {
    observer: IntersectionObserver;
    callbacks: WeakMap<Element, (isVisible: boolean) => void>;
}

const observerBuckets = new Map<string, ObserverBucket>();

const getObserverBucket = (rootMargin: string): ObserverBucket => {
    const marginKey = rootMargin || '0px';
    const existing = observerBuckets.get(marginKey);

    if (existing) {
        return existing;
    }

    const callbacks = new WeakMap<Element, (isVisible: boolean) => void>();

    // One shared observer per rootMargin keeps memory/CPU low for large lists.
    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const callback = callbacks.get(entry.target);
            if (callback) {
                callback(entry.isIntersecting);
            }
        }
    }, {
        root: null,
        rootMargin: marginKey,
        threshold: 0
    });

    const bucket = { observer, callbacks };
    observerBuckets.set(marginKey, bucket);

    return bucket;
};

@Directive({
    selector: '[appViewportObserver]',
    standalone: false
})
export class ViewportObserverDirective implements AfterViewInit, OnDestroy {
    public rootMargin = input('0px');
    public leaveDelayMs = input(0);
    public observeKey = input(0);
    public viewportChange = output<boolean>();

    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    private bucket?: ObserverBucket;
    private lastState?: boolean;
    private latestIsVisible = false;
    private leaveTimeoutId?: ReturnType<typeof setTimeout>;

    constructor() {
        effect(() => {
            this.observeKey();
            if (!this.bucket) {
                return;
            }

            this.reobserve();
        });
    }

    ngAfterViewInit(): void {
        // Non-browser or unsupported environment: keep content visible.
        if (typeof IntersectionObserver === 'undefined') {
            this.viewportChange.emit(true);
            return;
        }

        this.bucket = getObserverBucket(this.rootMargin());

        const element = this.element.nativeElement;
        this.bucket.callbacks.set(element, (isVisible: boolean) => {
            this.latestIsVisible = isVisible;
            this.handleVisibilityChange(isVisible);
        });

        this.bucket.observer.observe(element);
    }

    ngOnDestroy(): void {
        if (this.leaveTimeoutId) {
            clearTimeout(this.leaveTimeoutId);
        }

        if (!this.bucket) {
            return;
        }

        const element = this.element.nativeElement;
        this.bucket.callbacks.delete(element);
        this.bucket.observer.unobserve(element);
    }

    private reobserve(): void {
        if (!this.bucket) {
            return;
        }

        if (this.leaveTimeoutId) {
            clearTimeout(this.leaveTimeoutId);
            this.leaveTimeoutId = undefined;
        }

        this.lastState = undefined;

        const element = this.element.nativeElement;
        this.bucket.observer.unobserve(element);
        this.bucket.observer.observe(element);
    }

    private handleVisibilityChange(isVisible: boolean): void {
        if (isVisible) {
            // Immediate show when entering; cancels any pending "hide".
            if (this.leaveTimeoutId) {
                clearTimeout(this.leaveTimeoutId);
                this.leaveTimeoutId = undefined;
            }

            this.emitIfChanged(true);
            return;
        }

        const delay = this.leaveDelayMs();
        if (delay > 0) {
            // Delayed hide prevents flicker when quickly scrolling.
            if (this.leaveTimeoutId) {
                clearTimeout(this.leaveTimeoutId);
            }

            this.leaveTimeoutId = setTimeout(() => {
                if (!this.latestIsVisible) {
                    this.emitIfChanged(false);
                }
            }, delay);
            return;
        }

        this.emitIfChanged(false);
    }

    private emitIfChanged(isVisible: boolean): void {
        if (this.lastState === isVisible) {
            return;
        }

        this.lastState = isVisible;
        this.viewportChange.emit(isVisible);
    }
}
