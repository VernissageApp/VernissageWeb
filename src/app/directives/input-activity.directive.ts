import { Directive, HostListener, inject } from '@angular/core';
import { FocusTrackerService } from '../services/common/focus-tracker.service';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: `
        input[type=text],
        input[type=email],
        input[type=number],
        input[type=password],
        input[type=search],
        input[type=tel],
        input[type=url],
        textarea,
        [contenteditable="true"]
    `,
    standalone: false
})
export class InputActivityDirective {
    private focusTrackerService = inject(FocusTrackerService);

    @HostListener('focus')
    onFocus() {
        this.focusTrackerService.setFocusState(true);
    }

    @HostListener('blur')
    onBlur() {
        this.focusTrackerService.setFocusState(false);
    }
}