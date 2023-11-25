import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html-pipe';

@NgModule({
    declarations: [
        SanitizeHtmlPipe
    ],
    imports: [

    ],
    exports: [
        SanitizeHtmlPipe
    ]
})
export class PipesModule { }
