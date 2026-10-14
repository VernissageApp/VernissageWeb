import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: '[appReleaseFocusOnPointerClick]' })
export class ReleaseFocusOnPointerClickDirective {
    private element = inject<ElementRef<HTMLElement>>(ElementRef);

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        // Keyboard and assistive-technology click events have no click count.
        // Keep their focus so the toggle group remains keyboard-navigable.
        if (event.detail === 0) {
            return;
        }

        const hostElement = this.element.nativeElement;
        const activeElement = hostElement.ownerDocument.activeElement;

        if (activeElement instanceof HTMLElement && hostElement.contains(activeElement)) {
            activeElement.blur();
        }
    }
}
