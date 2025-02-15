import {
    trigger,
    style,
    animate,
    transition,
    state
} from '@angular/animations';

export const showOrHideAnimation = [
    trigger('show', [
        state('false', style({ opacity: 0 })),
        state('true', style({ opacity: 1 })),
        transition('false => true', animate('500ms')),
    ]),
    trigger('hide', [
        state('false', style({ opacity: 0 })),
        state('true', style({ opacity: 1 })),
        transition('true => false', animate('500ms')),
    ]),
    trigger('showOrHide', [
        state('false', style({ opacity: 0 })),
        state('true', style({ opacity: 1 })),
        transition('false <=> true', animate('500ms')),
    ]),
]
