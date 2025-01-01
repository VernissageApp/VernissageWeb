import { Directive, Input, Inject, OnDestroy, ElementRef, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
    selector: '[appNoteProcessor]',
    standalone: false
})
export class NoteProcessorDirective implements OnDestroy {

    @Input('appNoteProcessor') selector?: string;
    private observer: any;

    constructor(
        private zone: NgZone,
        private element: ElementRef,
        @Inject(PLATFORM_ID) private platformId: object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => {
                this.observer = new MutationObserver(() =>
                    this.addBootstrapClass(this.selector)
                );

                this.observer.observe(this.element.nativeElement, {
                    childList: true
                });
            });
        }
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private addBootstrapClass(selector?: string): void {
        const elementsToChangeImageLinks = this.element.nativeElement.querySelectorAll(selector || 'a');

        for (const item of elementsToChangeImageLinks) {
            this.changeLinkToHashtags(item);
        }
    }

    private changeLinkToHashtags(elementItem: HTMLAnchorElement): void {
        const classes = elementItem.getAttribute('class');
        if (classes?.includes('hashtag')) {
            const hashtag = elementItem.innerText.replace('#', '');
            elementItem.setAttribute('href', '/tags/' + hashtag);
        }
    }
}

