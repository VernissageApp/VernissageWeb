import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DEVICES, DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { WindowService } from '../../../services/common/window.service';

@Component({
    selector: 'app-scroll-to-top',
    imports: [MatIcon, MatTooltip, TranslatePipe],
    templateUrl: './scroll-to-top.component.html',
    styleUrl: './scroll-to-top.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { tabindex: '-1' }
})
export class ScrollToTopComponent implements AfterViewInit, OnDestroy {
    protected visible = signal(false);

    private element = inject<ElementRef<HTMLElement>>(ElementRef);
    private zone = inject(NgZone);
    private router = inject(Router);
    private windowService = inject(WindowService);
    private platformId = inject(PLATFORM_ID);
    private deviceDetectorService = inject(DeviceDetectorService);
    private observer?: IntersectionObserver;
    private navigationSubscription?: Subscription;
    private frameId?: number;
    private observing = false;

    ngAfterViewInit(): void {
        if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
            return;
        }

        // Skip observation entirely on iPhone, rather than just hiding the button.
        if (this.deviceDetectorService.device() === DEVICES.IPHONE) {
            return;
        }

        this.zone.runOutsideAngular(() => {
            this.observer = new IntersectionObserver(entries => {
                const entry = entries[entries.length - 1];
                if (!entry || !this.observing) {
                    return;
                }

                // A detached route or a marker below the viewport must not show the button.
                this.setVisible(this.element.nativeElement.isConnected && !entry.isIntersecting
                    && entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? -800));
            }, { root: null, rootMargin: '800px 0px 0px 0px', threshold: 0 });

            this.observeWhenConnected();
            this.navigationSubscription = this.router.events.subscribe(event => {
                if (event instanceof NavigationStart) {
                    this.stopObserving();
                } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                    this.observeWhenConnected();
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.stopObserving();
        this.navigationSubscription?.unsubscribe();
    }

    protected scrollToTop(): void {
        // Keep keyboard focus in the document when the button disappears.
        this.element.nativeElement.focus({ preventScroll: true });
        const reducedMotion = this.windowService.nativeWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.windowService.scrollToTop(reducedMotion ? 'instant' : 'smooth');
    }

    private observeWhenConnected(): void {
        this.zone.runOutsideAngular(() => {
            if (this.frameId !== undefined) {
                this.windowService.nativeWindow.cancelAnimationFrame(this.frameId);
            }
            // Reused routes have been attached by the next frame. This is a single
            // scheduled check per navigation, not a continuous animation-frame loop.
            this.frameId = this.windowService.nativeWindow.requestAnimationFrame(() => {
                this.frameId = undefined;
                this.observer?.disconnect();
                if (this.element.nativeElement.isConnected) {
                    this.observing = true;
                    this.observer?.observe(this.element.nativeElement);
                }
            });
        });
    }

    private stopObserving(): void {
        this.observing = false;
        if (this.frameId !== undefined) {
            this.windowService.nativeWindow.cancelAnimationFrame(this.frameId);
            this.frameId = undefined;
        }
        this.observer?.disconnect();
        this.setVisible(false);
    }

    private setVisible(visible: boolean): void {
        if (this.visible() !== visible) {
            this.zone.run(() => this.visible.set(visible));
        }
    }
}
