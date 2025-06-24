import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FocusTrackerService {
    public $isFocused = new BehaviorSubject<boolean>(false);
    public dialog = inject(MatDialog)

    setFocusState(focused: boolean) {
        this.$isFocused.next(focused);
    }

    get isCurrentlyFocused(): boolean {
        // If there are open dialogs, we consider the app focused.
        if (this.dialog.openDialogs && this.dialog.openDialogs.length) {
            return true;
        }

        return this.$isFocused.value;
    }
}
