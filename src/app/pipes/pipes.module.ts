import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { AgoPipe } from './ago.pipe';

@NgModule({
    declarations: [
        SanitizeHtmlPipe,
        AgoPipe
    ],
    imports: [

    ],
    exports: [
        SanitizeHtmlPipe,
        AgoPipe
    ]
})
export class PipesModule { }
