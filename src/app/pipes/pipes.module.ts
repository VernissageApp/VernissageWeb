import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './SanitizeHtmlPipe';

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
