import {
    trigger,
    style,
    animate,
    transition,
    state
} from '@angular/animations';

export const showOrHideAnimation = [
    trigger('showOrHide', [
        state('false', style({ opacity: 0 })),
        state('true', style({ opacity: 1 })),
        transition('false <=> true', animate('500ms')),
    ])
]