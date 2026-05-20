import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { AgoPipe } from './ago.pipe';
import { LocalizedDatePipe } from './localized-date.pipe';

@NgModule({
    declarations: [
        SanitizeHtmlPipe,
        AgoPipe,
        LocalizedDatePipe
    ],
    imports: [

    ],
    exports: [
        SanitizeHtmlPipe,
        AgoPipe,
        LocalizedDatePipe
    ]
})
export class PipesModule { }
