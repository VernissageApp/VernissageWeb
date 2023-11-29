import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ScrollNearEndDirective } from './scroll-near-end-directive';

@NgModule({
    declarations: [
        ScrollNearEndDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    exports: [
        ScrollNearEndDirective
    ]
})
export class DirectivesModule { }
