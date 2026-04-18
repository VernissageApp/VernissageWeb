import { ChangeDetectionStrategy, Component, effect, ElementRef, HostListener, inject, input, OnDestroy, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-popover',
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PopoverComponent implements OnDestroy {
    public visible = input(false);
    public enterAnimation = input('popover-fade-in');
    public leaveAnimation = input('popover-fade-out');

    protected offsetX = signal(0);
    protected panel = viewChild<ElementRef<HTMLDivElement> | undefined>('panel');

    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);
    private adjustAnimationFrame?: number;
    private adjustTimeout?: ReturnType<typeof setTimeout>;
    private resizeObserver?: ResizeObserver;
    private readonly viewportHorizontalPadding = 8;

    constructor() {
        effect(() => {
            const isVisible = this.visible();

            if (isVisible) {
                this.offsetX.set(0);
                this.scheduleHorizontalAdjustment();
            } else {
                this.offsetX.set(0);
                this.clearPendingHorizontalAdjustment();
            }
        });

        effect(() => {
            const panelElement = this.panel()?.nativeElement;
            this.updateResizeObserver(panelElement);

            if (panelElement && this.visible()) {
                this.scheduleHorizontalAdjustment();
            }
        });
    }

    ngOnDestroy(): void {
        this.clearPendingHorizontalAdjustment();
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        if (this.visible()) {
            this.scheduleHorizontalAdjustment();
        }
    }

    private updateResizeObserver(panelElement?: HTMLDivElement): void {
        if (!this.isBrowser) {
            return;
        }

        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;

        if (!panelElement || typeof ResizeObserver === 'undefined') {
            return;
        }

        this.resizeObserver = new ResizeObserver(() => {
            this.scheduleHorizontalAdjustment();
        });

        this.resizeObserver.observe(panelElement);
    }

    private scheduleHorizontalAdjustment(): void {
        if (!this.isBrowser) {
            return;
        }

        this.clearPendingHorizontalAdjustment();

        this.adjustAnimationFrame = window.requestAnimationFrame(() => {
            this.adjustAnimationFrame = undefined;
            this.adjustHorizontalPosition();
        });

        this.adjustTimeout = setTimeout(() => {
            this.adjustTimeout = undefined;
            this.adjustHorizontalPosition();
        }, 60);
    }

    private adjustHorizontalPosition(): void {
        if (!this.visible()) {
            return;
        }

        const panelElement = this.panel()?.nativeElement;
        if (!panelElement) {
            return;
        }

        const rect = panelElement.getBoundingClientRect();
        const maxRight = window.innerWidth - this.viewportHorizontalPadding;
        const minLeft = this.viewportHorizontalPadding;
        let desiredOffset = this.offsetX();

        if (rect.right > maxRight) {
            desiredOffset = desiredOffset - (rect.right - maxRight);
        }

        if (rect.left < minLeft) {
            desiredOffset = desiredOffset + (minLeft - rect.left);
        }

        this.offsetX.set(Math.round(desiredOffset));
    }

    private clearPendingHorizontalAdjustment(): void {
        if (this.adjustTimeout) {
            clearTimeout(this.adjustTimeout);
            this.adjustTimeout = undefined;
        }

        if (this.adjustAnimationFrame !== undefined && this.isBrowser) {
            window.cancelAnimationFrame(this.adjustAnimationFrame);
            this.adjustAnimationFrame = undefined;
        }
    }
}
