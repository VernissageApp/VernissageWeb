import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FocusTrackerService {
    public $isFocused = new BehaviorSubject<boolean>(false);

    setFocusState(focused: boolean) {
        this.$isFocused.next(focused);
    }

    get isCurrentlyFocused(): boolean {
        return this.$isFocused.value;
    }
}
