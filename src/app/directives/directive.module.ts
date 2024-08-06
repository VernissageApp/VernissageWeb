import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ScrollNearEndDirective } from './scroll-near-end.directive';
import { LazyLoadDirective } from './lazy-load.directive';

@NgModule({
    declarations: [
        ScrollNearEndDirective,
        LazyLoadDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    exports: [
        ScrollNearEndDirective,
        LazyLoadDirective
    ]
})
export class DirectivesModule { }
