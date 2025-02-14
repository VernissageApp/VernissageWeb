import {
    trigger,
    style,
    animate,
    transition,
    keyframes
} from '@angular/animations';

export const fadeInAnimation = [
    trigger('fadeIn', [
        transition(':enter', [   // :enter is alias to 'void => *'
            style({ opacity: 0 }),
            animate(500, style({ opacity: 1 }))
        ])
    ]),
    trigger('slowFadeIn', [
        transition(':enter', [   // :enter is alias to 'void => *'
            style({ opacity: 0 }),
            animate(
                1200,
                keyframes([
                  style({opacity: 0, offset: 0}),
                  style({opacity: 0, offset: 0.6}),
                  style({opacity: 1, offset: 1.0}),
                ]),
            )
        ])
    ])
];
