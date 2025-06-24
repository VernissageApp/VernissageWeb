import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FocusTrackerService {
    public $isFocused = new BehaviorSubject<boolean>(false);
    public dialog = inject(MatDialog)
    private document = inject(DOCUMENT);

    setFocusState(focused: boolean) {
        this.$isFocused.next(focused);
    }

    get isCurrentlyFocused(): boolean {
        // If there are open dialogs, we consider the app focused.
        if (this.dialog.openDialogs && this.dialog.openDialogs.length) {
            return true;
        }

        // If there are any overlays open (like mat-select), we consider the app focused.
        const overlayContainer = this.document.body.querySelector('.cdk-overlay-pane');
        const isOverlayOpen = overlayContainer && overlayContainer.childElementCount > 0;
        if (isOverlayOpen) {
            return true;
        }

        return this.$isFocused.value;
    }
}
