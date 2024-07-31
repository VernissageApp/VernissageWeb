import {
    trigger,
    style,
    animate,
    transition
} from '@angular/animations';

export const fadeInAnimation = [
    trigger('fadeIn', [
        transition(':enter', [   // :enter is alias to 'void => *'
            style({ opacity: 0 }),
            animate(500, style({ opacity: 1 }))
        ])
    ])
];
