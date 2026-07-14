import { Directive, OnDestroy, ElementRef, NgZone, PLATFORM_ID, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({ selector: '[appNoteProcessor]' })
export class NoteProcessorDirective implements OnDestroy {

    readonly selector = input<string>(undefined, { alias: 'appNoteProcessor' });
    private observer: any;

    private zone = inject(NgZone);
    private element = inject(ElementRef);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => {
                this.observer = new MutationObserver(() =>
                    this.addBootstrapClass(this.selector())
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
