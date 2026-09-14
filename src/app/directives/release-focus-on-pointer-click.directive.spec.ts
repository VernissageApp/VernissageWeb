import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReleaseFocusOnPointerClickDirective } from './release-focus-on-pointer-click.directive';

describe('ReleaseFocusOnPointerClickDirective', () => {
    const contains = vi.fn<(element: Element) => boolean>();

    let activeElement: HTMLButtonElement;
    let blur: ReturnType<typeof vi.spyOn>;
    let directive: ReleaseFocusOnPointerClickDirective;

    beforeEach(() => {
        activeElement = document.createElement('button');
        blur = vi.spyOn(activeElement, 'blur');
        contains.mockReset();
        contains.mockReturnValue(true);

        const hostElement = {
            ownerDocument: { activeElement },
            contains
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: ElementRef, useValue: new ElementRef(hostElement) }
            ]
        });

        directive = TestBed.runInInjectionContext(() => new ReleaseFocusOnPointerClickDirective());
    });

    it('releases focus from a child after a pointer click', () => {
        directive.onClick(new MouseEvent('click', { detail: 1 }));

        expect(blur).toHaveBeenCalledOnce();
    });

    it('preserves focus after keyboard activation', () => {
        directive.onClick(new MouseEvent('click', { detail: 0 }));

        expect(blur).not.toHaveBeenCalled();
    });

    it('does not blur an element outside the host', () => {
        contains.mockReturnValue(false);

        directive.onClick(new MouseEvent('click', { detail: 1 }));

        expect(blur).not.toHaveBeenCalled();
    });
});
